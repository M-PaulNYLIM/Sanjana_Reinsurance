const fs = require('fs');
const path = require('path');

const headers = [
  'reinsurer_id',
  'reinsurer_name',
  'treaty_id',
  'quota_share_pct',
  'ceding_allowance_premium_pct',
  'ceding_allowance_av_pct',
  'expense_allowance_commission_pct',
  'expense_allowance_premium_pct',
  'money_type',
  'channel',
  'territory',
  'product_name',
  'product_code',
  'tenor',
];

const data = `Reinsurer ID (NAIC#)\tReinsurer Name\tReinsurer Treaty ID\tQuota Share %\tCeding Allowance % Premium (up front)\tCeding Allowance % average AV during month (applied monthly)\tExpense Allowance % Commission (up front)\tExpense Allowance % Premium (up front)\tMoney Type (Internal/ External)\tChannel\tTerritory/ Issue State\tProduct Name\tProduct Code\tTenor (Gtd Period)
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.30\t0.00\t0.20\tExternal\tTPD-Fidelity\tNW\tSecure Term MVA Fixed Annuity IV\t2P\t3
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.35\t0.00\t0.20\tExternal\tTPD-Fidelity\tNW\tSecure Term MVA Fixed Annuity IV\t2P\t4
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.30\t0.00\t0.20\tExternal\tTPD-Fidelity\tNW\tSecure Term MVA Fixed Annuity IV\t2P\t5
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.45\t0.00\t0.20\tExternal\tTPD-Fidelity\tNW\tSecure Term MVA Fixed Annuity IV\t2P\t6
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II\t2D\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II\t2D\t4
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II\t2D\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.60\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II\t2D\t6
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.70\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II\t2D\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II\t2D\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II\t2D\t4
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II\t2D\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.60\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II\t2D\t6
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.70\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II\t2D\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t4
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.60\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t6
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.70\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t4
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.60\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t6
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.70\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity III (Merrill Lynch)\t2G\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity III (Merrill Lynch)\t2G\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.70\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term MVA Fixed Annuity III (Merrill Lynch)\t2G\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity III (Merrill Lynch)\t2G\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity III (Merrill Lynch)\t2G\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.70\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term MVA Fixed Annuity III (Merrill Lynch)\t2G\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNW\tSecure Term MVA Fixed Annuity \t1D\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNW\tSecure Term MVA Fixed Annuity \t1D\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNW\tSecure Term MVA Fixed Annuity \t1D\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNW\tSecure Term MVA Fixed Annuity \t1D\t6
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNW\tSecure Term MVA Fixed Annuity \t1D\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNW\tSecure Term MVA Fixed Annuity \t1D\t8
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term MVA Fixed Annuity \t1D\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term MVA Fixed Annuity \t1D\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term MVA Fixed Annuity \t1D\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term MVA Fixed Annuity \t1D\t6
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term MVA Fixed Annuity \t1D\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term MVA Fixed Annuity \t1D\t8
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.70\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term Choice Fixed Annuity II\t4C\t3
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.60\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term Choice Fixed Annuity II\t4C\t4
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.25\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term Choice Fixed Annuity II\t4C\t5
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.35\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term Choice Fixed Annuity II\t4C\t6
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term Choice Fixed Annuity II\t4C\t7
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.70\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term Choice Fixed Annuity II\t4C\t3
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.60\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term Choice Fixed Annuity II\t4C\t4
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.25\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term Choice Fixed Annuity II\t4C\t5
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.35\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term Choice Fixed Annuity II\t4C\t6
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term Choice Fixed Annuity II\t4C\t7
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.70\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term Choice Fixed Annuity III (Merrill Lynch)\t5C\t3
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.25\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term Choice Fixed Annuity III (Merrill Lynch)\t5C\t5
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNW\tSecure Term Choice Fixed Annuity III (Merrill Lynch)\t5C\t7
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.70\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term Choice Fixed Annuity III (Merrill Lynch)\t5C\t3
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.25\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term Choice Fixed Annuity III (Merrill Lynch)\t5C\t5
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNW\tSecure Term Choice Fixed Annuity III (Merrill Lynch)\t5C\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t1.15\tExternal\tAGY\tNW\tSecure Term Choice Fixed Annuity \t1C\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.55\t0.00\t1.20\tExternal\tAGY\tNW\tSecure Term Choice Fixed Annuity \t1C\t4
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.10\t0.00\t1.80\tExternal\tAGY\tNW\tSecure Term Choice Fixed Annuity \t1C\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.25\t0.00\t1.80\tExternal\tAGY\tNW\tSecure Term Choice Fixed Annuity \t1C\t6
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t1.85\tExternal\tAGY\tNW\tSecure Term Choice Fixed Annuity \t1C\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t1.85\tExternal\tAGY\tNW\tSecure Term Choice Fixed Annuity \t1C\t8
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term Choice Fixed Annuity \t1C\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term Choice Fixed Annuity \t1C\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term Choice Fixed Annuity \t1C\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term Choice Fixed Annuity \t1C\t6
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term Choice Fixed Annuity \t1C\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term Choice Fixed Annuity \t1C\t8
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tTPD\tNW\tSecure Term Fixed Annuity IV - CP Series\t5D\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tTPD\tNW\tSecure Term Fixed Annuity IV - CP Series\t5D\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tTPD\tNW\tSecure Term Fixed Annuity IV - CP Series\t5D\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tTPD\tNW\tSecure Term Fixed Annuity IV - CP Series\t5D\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tTPD\tNW\tSecure Term Fixed Annuity IV - CP Series\t5D\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tTPD\tNW\tSecure Term Fixed Annuity IV - CP Series\t5D\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tTPD\tNW\tSecure Term Fixed Annuity IV - CP Series\t5D\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tTPD\tNW\tSecure Term Fixed Annuity IV - CP Series\t5D\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNW\tSecure Term Fixed Annuity IV \t1F\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNW\tSecure Term Fixed Annuity IV \t1F\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNW\tSecure Term Fixed Annuity IV \t1F\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNW\tSecure Term Fixed Annuity IV \t1F\t6
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNW\tSecure Term Fixed Annuity IV \t1F\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNW\tSecure Term Fixed Annuity IV \t1F\t8
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term Fixed Annuity IV \t1F\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term Fixed Annuity IV \t1F\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term Fixed Annuity IV \t1F\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term Fixed Annuity IV \t1F\t6
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term Fixed Annuity IV \t1F\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNW\tSecure Term Fixed Annuity IV \t1F\t8
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.30\t0.00\t0.20\tExternal\tTPD-Fidelity\tNY\tSecure Term MVA Fixed Annuity IV\t2P\t3
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.35\t0.00\t0.20\tExternal\tTPD-Fidelity\tNY\tSecure Term MVA Fixed Annuity IV\t2P\t4
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.30\t0.00\t0.20\tExternal\tTPD-Fidelity\tNY\tSecure Term MVA Fixed Annuity IV\t2P\t5
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.45\t0.00\t0.20\tExternal\tTPD-Fidelity\tNY\tSecure Term MVA Fixed Annuity IV\t2P\t6
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II\t2D\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II\t2D\t4
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II\t2D\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.60\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II\t2D\t6
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.70\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II\t2D\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II\t2D\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II\t2D\t4
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II\t2D\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.60\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II\t2D\t6
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.70\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II\t2D\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t4
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.60\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t6
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.70\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t4
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.60\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t6
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.70\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity II (High Age)\t2E\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity III (Merrill Lynch)\t2G\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity III (Merrill Lynch)\t2G\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.70\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term MVA Fixed Annuity III (Merrill Lynch)\t2G\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity III (Merrill Lynch)\t2G\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity III (Merrill Lynch)\t2G\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.70\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term MVA Fixed Annuity III (Merrill Lynch)\t2G\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNY\tSecure Term MVA Fixed Annuity \t1D\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNY\tSecure Term MVA Fixed Annuity \t1D\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNY\tSecure Term MVA Fixed Annuity \t1D\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNY\tSecure Term MVA Fixed Annuity \t1D\t6
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNY\tSecure Term MVA Fixed Annuity \t1D\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNY\tSecure Term MVA Fixed Annuity \t1D\t8
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term MVA Fixed Annuity \t1D\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term MVA Fixed Annuity \t1D\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term MVA Fixed Annuity \t1D\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term MVA Fixed Annuity \t1D\t6
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term MVA Fixed Annuity \t1D\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term MVA Fixed Annuity \t1D\t8
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.70\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term Choice Fixed Annuity II\t4C\t3
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.60\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term Choice Fixed Annuity II\t4C\t4
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.25\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term Choice Fixed Annuity II\t4C\t5
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.35\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term Choice Fixed Annuity II\t4C\t6
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term Choice Fixed Annuity II\t4C\t7
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.70\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term Choice Fixed Annuity II\t4C\t3
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.60\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term Choice Fixed Annuity II\t4C\t4
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.25\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term Choice Fixed Annuity II\t4C\t5
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.35\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term Choice Fixed Annuity II\t4C\t6
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term Choice Fixed Annuity II\t4C\t7
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.70\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term Choice Fixed Annuity III (Merrill Lynch)\t5C\t3
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.25\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term Choice Fixed Annuity III (Merrill Lynch)\t5C\t5
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.45\t0.00\t0.55\tExternal\tTPD\tNY\tSecure Term Choice Fixed Annuity III (Merrill Lynch)\t5C\t7
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.70\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term Choice Fixed Annuity III (Merrill Lynch)\t5C\t3
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.25\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term Choice Fixed Annuity III (Merrill Lynch)\t5C\t5
60186\tEverlake Life Insurance Company \t01\t40.00\t0.00\t0.45\t0.00\t0.55\tInternal\tTPD\tNY\tSecure Term Choice Fixed Annuity III (Merrill Lynch)\t5C\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.45\t0.00\t1.15\tExternal\tAGY\tNY\tSecure Term Choice Fixed Annuity \t1C\t3
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.55\t0.00\t1.20\tExternal\tAGY\tNY\tSecure Term Choice Fixed Annuity \t1C\t4
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.10\t0.00\t1.80\tExternal\tAGY\tNY\tSecure Term Choice Fixed Annuity \t1C\t5
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.25\t0.00\t1.80\tExternal\tAGY\tNY\tSecure Term Choice Fixed Annuity \t1C\t6
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t1.85\tExternal\tAGY\tNY\tSecure Term Choice Fixed Annuity \t1C\t7
60186\tEverlake Life Insurance Company \t01\t25.00\t0.00\t0.30\t0.00\t1.85\tExternal\tAGY\tNY\tSecure Term Choice Fixed Annuity \t1C\t8
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term Choice Fixed Annuity \t1C\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term Choice Fixed Annuity \t1C\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term Choice Fixed Annuity \t1C\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term Choice Fixed Annuity \t1C\t6
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term Choice Fixed Annuity \t1C\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term Choice Fixed Annuity \t1C\t8
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tTPD\tNY\tSecure Term Fixed Annuity IV - CP Series\t5D\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tTPD\tNY\tSecure Term Fixed Annuity IV - CP Series\t5D\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tTPD\tNY\tSecure Term Fixed Annuity IV - CP Series\t5D\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tTPD\tNY\tSecure Term Fixed Annuity IV - CP Series\t5D\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tTPD\tNY\tSecure Term Fixed Annuity IV - CP Series\t5D\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tTPD\tNY\tSecure Term Fixed Annuity IV - CP Series\t5D\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tTPD\tNY\tSecure Term Fixed Annuity IV - CP Series\t5D\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tTPD\tNY\tSecure Term Fixed Annuity IV - CP Series\t5D\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNY\tSecure Term Fixed Annuity IV \t1F\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNY\tSecure Term Fixed Annuity IV \t1F\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNY\tSecure Term Fixed Annuity IV \t1F\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNY\tSecure Term Fixed Annuity IV \t1F\t6
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNY\tSecure Term Fixed Annuity IV \t1F\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tExternal\tAGY\tNY\tSecure Term Fixed Annuity IV \t1F\t8
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term Fixed Annuity IV \t1F\t3
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term Fixed Annuity IV \t1F\t4
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term Fixed Annuity IV \t1F\t5
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term Fixed Annuity IV \t1F\t6
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term Fixed Annuity IV \t1F\t7
60186\tEverlake Life Insurance Company \t01\t0.00\t0.00\t0.00\t0.00\t0.00\tInternal\tAGY\tNY\tSecure Term Fixed Annuity IV \t1F\t8`;

const lines = data.trim().split('\n');
const rows = lines.slice(1).map((line, index) => {
  const parts = line.split('\t');
  if (parts.length !== headers.length) {
    throw new Error(`Row ${index + 2}: expected ${headers.length} columns, received ${parts.length}`);
  }
  const obj = {};
  headers.forEach((header, idx) => {
    obj[header] = parts[idx].trim();
  });
  return obj;
});

const basePremiums = {
  '2P|3': 72450.0,
  '2P|4': 73200.0,
  '2P|5': 73950.0,
  '2P|6': 74700.0,
  '2D|3': 61200.0,
  '2D|4': 62150.0,
  '2D|5': 63100.0,
  '2D|6': 64050.0,
  '2D|7': 65000.0,
  '2E|3': 61500.0,
  '2E|4': 62450.0,
  '2E|5': 63400.0,
  '2E|6': 64350.0,
  '2E|7': 65300.0,
  '2G|3': 68800.0,
  '2G|5': 69800.0,
  '2G|7': 70800.0,
  '1D|3': 48200.0,
  '1D|4': 48750.0,
  '1D|5': 49300.0,
  '1D|6': 49850.0,
  '1D|7': 50400.0,
  '1D|8': 50950.0,
  '4C|3': 81200.0,
  '4C|4': 82250.0,
  '4C|5': 83300.0,
  '4C|6': 84350.0,
  '4C|7': 85400.0,
  '5C|3': 82600.0,
  '5C|5': 83650.0,
  '5C|7': 84700.0,
  '1C|3': 75200.0,
  '1C|4': 76250.0,
  '1C|5': 77300.0,
  '1C|6': 78350.0,
  '1C|7': 79400.0,
  '1C|8': 80450.0,
  '5D|3': 56600.0,
  '5D|4': 57250.0,
  '5D|5': 57900.0,
  '5D|7': 59200.0,
  '1F|3': 53600.0,
  '1F|4': 54350.0,
  '1F|5': 55100.0,
  '1F|6': 55850.0,
  '1F|7': 56600.0,
  '1F|8': 57350.0,
};

const moneyAdjust = { External: 0.0, Internal: 180.0 };
const territoryAdjust = { NW: 0.0, NY: 220.0 };
const channelAdjust = { 'TPD-Fidelity': 95.0, TPD: 70.0, AGY: 40.0 };

const weekKey = '2025-10-06_2025-10-12';
const periodStartDate = '2025-10-06';
const periodEndDate = '2025-10-12';

const createdRecords = rows.map((row, idx) => {
  const productCode = row.product_code;
  const tenor = row.tenor;
  const baseKey = `${productCode}|${tenor}`;
  const basePremium = basePremiums[baseKey];
  if (basePremium === undefined) {
    throw new Error(`Missing base premium for ${baseKey}`);
  }
  const premiumRaw = basePremium + (moneyAdjust[row.money_type] || 0) + (territoryAdjust[row.territory] || 0) + (channelAdjust[row.channel] || 50) + (idx % 5) * 37;
  const premiums = Number(premiumRaw.toFixed(2));
  const endingAv = Number((premiums * 1.003).toFixed(2));
  const quotaShare = row.quota_share_pct ? Number(row.quota_share_pct) : 0;
  const reEndingAv = Number((endingAv * quotaShare / 100).toFixed(2));
  const expenseCommPct = row.expense_allowance_commission_pct ? Number(row.expense_allowance_commission_pct) : 0;
  const commissionAmt = Number((premiums * (expenseCommPct / 100)).toFixed(2));

  return {
    weekKey,
    periodStartDate,
    periodEndDate,
    reinsurerId: row.reinsurer_id,
    reinsurerName: row.reinsurer_name.trim(),
    treatyId: row.treaty_id,
    quotaShare: quotaShare,
    cedingAllowancePrem: Number((Number(row.ceding_allowance_premium_pct) / 100).toFixed(4)),
    cedingAllowanceAv: Number((Number(row.ceding_allowance_av_pct) / 100).toFixed(4)),
    expenseAllowancePrem: Number((Number(row.expense_allowance_premium_pct) / 100).toFixed(4)),
    expenseAllowanceComm: Number((expenseCommPct / 100).toFixed(4)),
    policyNumber: `POL-${productCode}-${tenor}-${String(idx + 1).padStart(3, '0')}`,
    productName: row.product_name.trim(),
    productCode,
    issueStateCode: row.territory,
    premiums,
    endingAv,
    reEndingAv,
    partialSurrender: 0,
    surrender: 0,
    annuitization: 0,
    death: 0,
    transfers: 0,
    fees: 0,
    commissionAmt,
    tenor,
    moneyType: row.money_type,
    channel: row.channel,
  };
});

const jsonPath = path.resolve('reinsurance-angular/public/mock/reinsurance-weekly.json');
const existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const retained = existingData.filter(entry => entry.weekKey !== weekKey);
const updated = retained.concat(createdRecords);
fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 2));
console.log(`Updated ${jsonPath} with ${createdRecords.length} records for ${weekKey}.`);
