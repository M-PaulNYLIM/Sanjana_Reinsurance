import { promises as fs } from 'fs';
import path from 'path';
import ts from 'typescript';

interface ComponentMetadata {
  className: string;
  htmlContent: string;
  scssContent: string;
  htmlPath: string;
  scssPath: string;
  specPath: string;
  importPath: string;
  tsFilePath: string;
}

const projectRoot = path.resolve('src');

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return Promise.resolve([fullPath]);
    }),
  );
  return files.flat().filter((file) => file.endsWith('.ts'));
}

function classNameToFileBase(className: string): string {
  const withoutComponent = className.endsWith('Component')
    ? className.slice(0, -'Component'.length)
    : className;
  const withSeparators = withoutComponent
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
  return `${withSeparators}.component`;
}

function createTemplateUrlProperty(fileBase: string): ts.PropertyAssignment {
  return ts.factory.createPropertyAssignment(
    ts.factory.createIdentifier('templateUrl'),
    ts.factory.createStringLiteral(`./${fileBase}.html`),
  );
}

function createStyleUrlsProperty(fileBase: string): ts.PropertyAssignment {
  return ts.factory.createPropertyAssignment(
    ts.factory.createIdentifier('styleUrls'),
    ts.factory.createArrayLiteralExpression(
      [ts.factory.createStringLiteral(`./${fileBase}.scss`)],
      false,
    ),
  );
}

function findParentClass(node: ts.Node): ts.ClassDeclaration | undefined {
  let current: ts.Node | undefined = node;
  while (current) {
    if (ts.isClassDeclaration(current)) {
      return current;
    }
    current = current.parent;
  }
  return undefined;
}

async function modularizeFile(filePath: string, infos: ComponentMetadata[]): Promise<void> {
  const originalContent = await fs.readFile(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, originalContent, ts.ScriptTarget.Latest, true);

  let modified = false;

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    const visit: ts.Visitor = (node) => {
      if (ts.isObjectLiteralExpression(node)) {
        const parent = node.parent;
        if (
          ts.isCallExpression(parent) &&
          ts.isIdentifier(parent.expression) &&
          parent.expression.text === 'Component'
        ) {
          const classDeclaration = findParentClass(parent);
          if (!classDeclaration || !classDeclaration.name) {
            return node;
          }

          const className = classDeclaration.name.text;
          let templateLiteral: ts.NoSubstitutionTemplateLiteral | null = null;
          let collectedStyles: string[] = [];
          let hasTemplate = false;
          let hasTemplateUrl = false;
          let hasStylesArray = false;
          let hasStyleUrls = false;
          const fileBase = classNameToFileBase(className);

          const newProperties: ts.ObjectLiteralElementLike[] = [];

          for (const property of node.properties) {
            if (!ts.isPropertyAssignment(property)) {
              newProperties.push(property);
              continue;
            }

            const name = property.name;
            if (!name) {
              newProperties.push(property);
              continue;
            }

            const nameText = ts.isIdentifier(name) || ts.isStringLiteral(name)
              ? name.text
              : undefined;

            if (!nameText) {
              newProperties.push(property);
              continue;
            }

            if (nameText === 'template') {
              hasTemplate = true;
              if (ts.isNoSubstitutionTemplateLiteral(property.initializer)) {
                templateLiteral = property.initializer;
              } else {
                throw new Error(`Component ${className} in ${filePath} uses unsupported template initializer.`);
              }
              newProperties.push(createTemplateUrlProperty(fileBase));
              continue;
            }

            if (nameText === 'templateUrl') {
              hasTemplateUrl = true;
              newProperties.push(property);
              continue;
            }

            if (nameText === 'styles') {
              hasStylesArray = true;
              if (ts.isArrayLiteralExpression(property.initializer)) {
                collectedStyles = property.initializer.elements
                  .filter(ts.isStringLiteral)
                  .map((literal) => literal.text);
              }
              newProperties.push(createStyleUrlsProperty(fileBase));
              continue;
            }

            if (nameText === 'styleUrls') {
              hasStyleUrls = true;
              newProperties.push(property);
              continue;
            }

            newProperties.push(property);
          }

          if (!hasTemplate && hasTemplateUrl) {
            return node;
          }

          if (!templateLiteral) {
            return node;
          }

          if (!hasStyleUrls && !hasStylesArray) {
            newProperties.push(createStyleUrlsProperty(fileBase));
          }

          const newObjectLiteral = ts.factory.updateObjectLiteralExpression(node, newProperties);

          const dir = path.dirname(filePath);
          const htmlPath = path.join(dir, `${fileBase}.html`);
          const scssPath = path.join(dir, `${fileBase}.scss`);
          const specPath = path.join(dir, `${fileBase}.spec.ts`);
          const importPath = `./${path.basename(filePath, '.ts')}`;

          infos.push({
            className,
            htmlContent: templateLiteral.text,
            scssContent: collectedStyles.join('\n'),
            htmlPath,
            scssPath,
            specPath,
            importPath,
            tsFilePath: filePath,
          });

          modified = true;
          return newObjectLiteral;
        }
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (node) => ts.visitNode(node, visit);
  };

  const result = ts.transform(sourceFile, [transformer]);
  const transformedSourceFile = result.transformed[0];
  result.dispose();

  if (!modified) {
    return;
  }

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const newContent = printer.printFile(transformedSourceFile);
  await fs.writeFile(filePath, newContent, 'utf8');
}

async function ensureFile(filePath: string, content: string): Promise<void> {
  try {
    await fs.access(filePath);
    if (content.trim().length === 0) {
      return;
    }
    const existing = await fs.readFile(filePath, 'utf8');
    if (existing === content) {
      return;
    }
  } catch {
    // continue to write
  }
  await fs.writeFile(filePath, content, 'utf8');
}

function createSpecContent(className: string, importPath: string): string {
  return `import { ComponentFixture, TestBed } from '@angular/core/testing';\n` +
    `import { ${className} } from '${importPath}';\n\n` +
    `describe('${className}', () => {\n` +
    `  let component: ${className};\n` +
    `  let fixture: ComponentFixture<${className}>;\n\n` +
    `  beforeEach(async () => {\n` +
    `    await TestBed.configureTestingModule({\n` +
    `      imports: [${className}],\n` +
    `    }).compileComponents();\n\n` +
    `    fixture = TestBed.createComponent(${className});\n` +
    `    component = fixture.componentInstance;\n` +
    `    fixture.detectChanges();\n` +
    `  });\n\n` +
    `  it('should create', () => {\n` +
    `    expect(component).toBeTruthy();\n` +
    `  });\n` +
    `});\n`;
}

async function run(): Promise<void> {
  const files = await walk(projectRoot);
  const componentInfos: ComponentMetadata[] = [];

  for (const file of files) {
    if (file.endsWith('.spec.ts')) {
      continue;
    }
    await modularizeFile(file, componentInfos);
  }

  for (const info of componentInfos) {
    await ensureFile(info.htmlPath, `${info.htmlContent}\n`);
    await ensureFile(info.scssPath, info.scssContent ? `${info.scssContent}\n` : '');

    try {
      await fs.access(info.specPath);
    } catch {
      await fs.writeFile(info.specPath, createSpecContent(info.className, info.importPath), 'utf8');
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
