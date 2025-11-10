export interface ReinsurerData {
    reinsurerId: string;
    reinsurerName: string;
    treatyId: string;
    quotaShare: number;
    cedingAllowancePrem: number;
    cedingAllowanceAv: number;
    expenseAllowancePrem: number;
    expenseAllowanceComm: number;
    periodStartDate: string;
    periodEndDate: string;
    policyNumber: string;
    productName: string;
    productCode?: string;
    issueStateCode: string;
    premiums: number;
    endingAv: number;
    reEndingAv: number;
    partialSurrender: number;
    surrender: number;
    annuitization: number;
    death: number;
    transfers: number;
    fees: number;
    commissionAmt: number;
    tenor: string;
    moneyType: string;
    channel: string;
}

export interface ProductPeriod {
    start: string;
    end: string;
    treaties: ReinsurerData[];
    viewAsTable: boolean;
}

export interface PolicyData {
    policyNumber: string;
    productName: string;
    issueStateCode: string;
    endingAv: number;
    premiums: number;
    reinsurerId: string;
    reinsurerName: string;
    periodStartDate: string;
    periodEndDate: string;
}

export interface RpdPolicyRecord {
    rpdPlyKey: string;
    rpdRpePeriodKey: string;
    policyNumber: string;
    issueDate: string;
    issuePremium: number;
    issueStateCode: string;
    residentStateCode: string;
    rateLockDate: string;
    reinsurerName: string;
    reinsurerId: string;
    treatyId: string;
    quotaShare: number;
    caAllPrem: number;
    caAllAv: number;
    expAllComm: number;
    expAllPrem: number;
    reinsuranceEndDate: string;
    rpProductKey: string;
    rfFirmKey: string;
    qualInd: string;
    intExtInd: string;
    ct1035Ind: string;
    endindAv: number;
}

export interface RpProduct {
    rpProductKey: string;
    rlLobKey: string;
    productName: string;
    productCode: string;
    tenor: string;
}

export interface EruRow {
    reinsurerId: string;
    reinsurerName: string;
    treatyId: string;
    quotaShare: number;
    productTitle: string;
    productCode: string;
    tenor: string;
    effectiveDate: string;
}

export interface RttTranType {
    key: string;
    rlLobKey: string;
    code: string;
    desc: string;
    category: string;
}

export interface RptPolTrans {
    key: string;
    typeKey: string;
    plyKey: string;
    tranDate: string;
    periodKey: string;
    amt: number;
    reverse: string;
    intReplacement: string;
}

export interface RtcCharge {
    rptPolTransKey: string;
    chargeCategory: string;
    chargeAmt: number;
}

export interface WeeklyBucket {
    key: string;
    start: string;
    end: string;
    label: string;
    totalPolicies: number;
    totalPremiums: number;
    totalEndingAv: number;
}
