import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule, IsActiveMatchOptions } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

import { AuthService } from '../../auth/auth.service';
import { NavigationLink } from '../../auth/auth.models';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { cn } from '../../../lib/utils';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  currentPath$!: Observable<string>;
  readonly navItems$!: Observable<NavigationLink[]>;

  constructor(private readonly router: Router, private readonly auth: AuthService) {
    this.navItems$ = this.auth.activeRole$.pipe(
      map(() => this.auth.getNavigationLinks()),
      startWith(this.auth.getNavigationLinks()),
    );
  }

  ngOnInit(): void {
    this.currentPath$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.url),
      startWith(this.router.url),
    );
  }

  isActive(path: string): boolean {
    const matchOptions: IsActiveMatchOptions = {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    };
    return this.router.isActive(path, matchOptions);
  }

  getNavLinkClasses(path: string): string {
    return cn(
      'px-1 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
      this.isActive(path)
        ? 'border-nyl-blue text-nyl-blue'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    );
  }
}
