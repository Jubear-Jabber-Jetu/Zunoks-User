// Auto-generated from ReCom_BAT_Benefits_Survey_Merged_2026.docx
export interface SurveyQuestion {
  id: string;
  label: string;
  type: string;
  options?: string[];
  hasInput?: boolean;
  allowMultiple?: boolean;
  columns?: string[];
  rows?: string[];
}

export interface SurveyModule {
  name: string;
  description?: string;
  questions: SurveyQuestion[];
}

export const STANDARD_GRADE_TABLE_ROWS = [
  'L1 — Top Management (CXO / MD)',
  'L2 — Senior Management (Director / VP)',
  'L3 — Middle Management (Manager)',
  'L4 — Junior Management (Assistant Manager/Sr. Officer)',
  'L5 — Entry Management (MT/Officer/Executive)',
];

export function formatQuestionDisplayId(moduleName: string, questionId: string): string {
  if (moduleName === 'Provident Fund' && questionId.startsWith('PF_')) {
    const match = questionId.match(/^PF_(\d+)_(\d+)/);
    if (match) return `${match[1]}.${match[2]}`;
  }
  if (moduleName === 'Gratuity' && questionId.startsWith('GF_')) {
    const match = questionId.match(/^GF_(\d+)_(\d+)/);
    if (match) return `${match[1]}.${match[2]}`;
  }
  if (moduleName === 'Leave Encashment' && questionId.startsWith('LE_')) {
    const match = questionId.match(/^LE_(\d+)_(\d+)/);
    if (match) return `${match[1]}.${match[2]}`;
  }
  if (moduleName === 'Retirement Age' && questionId.startsWith('RA_')) {
    const match = questionId.match(/^RA_(\d+)_(\d+)/);
    if (match) return `${match[1]}.${match[2]}`;
  }
  if (moduleName === 'Employment Termination Notice Period' && questionId.startsWith('ET_')) {
    const match = questionId.match(/^ET_(\d+)_(\d+)/);
    if (match) return `${match[1]}.${match[2]}`;
  }
  if (moduleName === 'Mobile Phone Set Policy' && questionId.startsWith('MP_')) {
    const match = questionId.match(/^MP_(\d+)_(\d+)/);
    if (match) return `${match[1]}.${match[2]}`;
  }
  return questionId.replace('_', '.');
}

export const SURVEY_MODULES: SurveyModule[] = [
  {
    "name": "Organizational Profile",
    "description": "Provide your organization details.",
    "questions": [
      {
        "id": "OP_1",
        "label": "Organization name",
        "type": "textarea",
        "options": []
      },
      {
        "id": "OP_2",
        "label": "Total number of management-level employees (permanent, full-time)",
        "type": "textarea",
        "options": []
      },
      {
        "id": "OP_3",
        "label": "Industry / Sector — select the primary sector that best describes your organization",
        "type": "radio",
        "options": [
          "Telecom",
          "FMCG / Consumer Goods",
          "Tobacco",
          "Energy / Oil & Gas",
          "Manufacturing / Coatings",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "OP_4",
        "label": "Name and designation of person completing this questionnaire",
        "type": "textarea",
        "options": []
      },
      {
        "id": "OP_4_name",
        "label": "Name of person completing questionnaire",
        "type": "text"
      },
      {
        "id": "OP_4_designation",
        "label": "Designation",
        "type": "text"
      },
      {
        "id": "OP_4_email",
        "label": "Email address",
        "type": "text"
      }
    ]
  },
  {
    "name": "Provident Fund",
    "description": "This module covers the design, eligibility, contribution structure, vesting rules, and payout mechanisms for Provident Fund (PF). Please respond separately for each scheme where applicable.",
    "questions": [
      {
        "id": "PF_1_1",
        "label": "Does your organization operate a Provident Fund scheme?",
        "type": "radio",
        "options": [
          "Yes — mandatory for all eligible employees",
          "Yes — optional / voluntary",
          "No — we do not operate a PF scheme",
          "Under review / planning to introduce"
        ]
      },
      {
        "id": "PF_1_2",
        "label": "PF eligibility — which employees are covered?",
        "type": "radio",
        "options": [
          "All permanent management upon confirmation",
          "All permanent management after a minimum service period"
        ]
      },
      {
        "id": "PF_1_3",
        "label": "Employee contribution rate (% of basic salary)",
        "type": "text"
      },
      {
        "id": "PF_1_4_employer_contribution",
        "label": "Employer contribution %",
        "type": "text"
      },
      {
        "id": "PF_1_4_employee_contribution",
        "label": "Employee contribution %",
        "type": "text"
      },
      {
        "id": "PF_1_4_details",
        "label": "Details",
        "type": "text"
      },
      {
        "id": "PF_1_4",
        "label": "Employer contribution rate (% of basic salary)",
        "type": "radio",
        "options": [
          "Equal match to employee contribution (100% match)",
          "Partial match — please specify % below",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "PF_1_5",
        "label": "Contribution base — what is the PF calculated on?",
        "type": "radio",
        "options": [
          "Basic salary only",
          "Gross salary",
          "Grade wise contributions"
        ]
      },
      {
        "id": "PF_table_1_5",
        "label": "Grade / Level",
        "type": "table",
        "columns": [
          "Employee contribution %",
          "Employer contribution %",
          "Contribution base"
        ],
        "rows": STANDARD_GRADE_TABLE_ROWS
      },
      {
        "id": "PF_1_6",
        "label": "PF disbursement on separation — when is PF paid out?",
        "type": "radio",
        "options": [
          "Immediately upon separation",
          "With Final & Full Settlement (FNF)",
          "After Board / Trustee approval",
          "Within a specific window",
          "After annual audit",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "PF_1_7",
        "label": "PF disbursement on separation — within how many days is PF paid out?",
        "type": "text"
      },
      {
        "id": "PF_1_8",
        "label": "Pre-audit profit payout — for employees separating before audit completion, how is the PF profit/income distributed?",
        "type": "radio",
        "options": [
          "Match with previous year profit rate",
          "Weighted average of current year",
          "Board-decided rate",
          "No pre-audit payout — paid after audit only",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "PF_1_9",
        "label": "Are employees permitted to withdraw PF membership?",
        "type": "radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "id": "PF_1_9_sub_reentry",
        "label": "Can the employee re-enter the PF scheme?",
        "type": "radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "id": "PF_1_9_sub_times",
        "label": "How many times?",
        "type": "text"
      },
      {
        "id": "PF_1_10",
        "label": "Are employees allowed to take loans from PF?",
        "type": "radio",
        "options": [
          "Yes",
          "No"
        ]
      },
      {
        "id": "PF_1_11",
        "label": "What is the interest rate?",
        "type": "text"
      },
      {
        "id": "PF_1_12",
        "label": "What is the maximum loan limit (% of total PF balance)?",
        "type": "text"
      },
      {
        "id": "PF_1_13",
        "label": "Minimum service requirement for loan eligibility",
        "type": "text"
      }
    ]
  },
  {
    "name": "Gratuity",
    "description": "This module covers the design, eligibility, contribution structure, vesting rules, and payout mechanisms for Gratuity. Please respond separately for each scheme where applicable.",
    "questions": [
      {
        "id": "GF_2_1",
        "label": "Does your organization provide Gratuity?",
        "type": "radio",
        "options": [
          "Yes",
          "No — do not provide",
          "Under review"
        ]
      },
      {
        "id": "GF_2_2",
        "label": "Minimum service requirement for Gratuity eligibility",
        "type": "radio",
        "options": [
          "More than 6 months",
          "1 year",
          "2 years",
          "3 years",
          "5 years",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "GF_2_3",
        "label": "Gratuity calculation basis — what is the multiplier applied?",
        "type": "radio",
        "options": [
          "Last drawn basic salary × years of completed service",
          "Last drawn gross salary × years of completed service",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "GF_2_4_scale_details",
        "label": "Scale details",
        "type": "text"
      },
      {
        "id": "GF_2_4",
        "label": "Gratuity payment rate — how many months' pay per year of service?",
        "type": "radio",
        "options": [
          "30 days (1 month) basic per year — statutory minimum",
          "45 days basic per year (enhanced)",
          "60 days basic per year (enhanced)",
          "Graduated scale — increases with tenure",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "GF_2_5",
        "label": "What happens in the case of dismissal on disciplinary grounds?",
        "type": "text"
      },
      {
        "id": "GF_2_6",
        "label": "Entitlement",
        "type": "text"
      },
      {
        "id": "GF_2_6_eligibility_start",
        "label": "Eligibility Start (Years)",
        "type": "radio",
        "options": [
          "1",
          "2",
          "3",
          "4",
          "5"
        ]
      },
      {
        "id": "GF_table_2_6",
        "label": "SL",
        "type": "table",
        "columns": [
          "From (Years)",
          "To (Years)"
        ],
        "rows": [
          "1",
          "2",
          "3",
          "4"
        ]
      }
    ]
  },
  {
    "name": "Leave Encashment",
    "description": "This module examines how organizations manage annual leave encashment — the conversion of unused leave entitlement to cash — covering eligibility, caps, timing, and calculation basis.",
    "questions": [
      {
        "id": "LE_3_1",
        "label": "Does your organization allow annual leave encashment?",
        "type": "radio",
        "options": [
          "Yes — during active service (annual encashment)",
          "Yes — only on separation (final settlement)",
          "Yes — both during service and on separation",
          "No — leave must be used or forfeited"
        ]
      },
      {
        "id": "LE_3_2",
        "label": "Eligibility for leave encashment — minimum service requirement",
        "type": "radio",
        "options": [
          "No minimum — eligible from date of joining",
          "After completion of probation period",
          "After 1 year of confirmed service",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "LE_3_3_days",
        "label": "Number of days",
        "type": "text"
      },
      {
        "id": "LE_3_3_percentage",
        "label": "Percentage",
        "type": "text"
      },
      {
        "id": "LE_3_3",
        "label": "Annual encashment — if offered during service, what is the maximum number of days encashable per year?",
        "type": "radio",
        "options": [
          "Number of days",
          "Percentage"
        ]
      },
      {
        "id": "LE_3_4",
        "label": "Annual encashment — how often can encashment be claimed in a year?",
        "type": "radio",
        "options": [
          "1",
          "2",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "LE_3_5_days",
        "label": "In days",
        "type": "text"
      },
      {
        "id": "LE_3_5",
        "label": "Separation encashment — maximum accumulated up to days encashable on exit",
        "type": "radio",
        "options": [
          "In days",
          "Not applicable — no encashment on separation"
        ]
      },
      {
        "id": "LE_3_7_ctc_formula",
        "label": "CTC formula",
        "type": "text"
      },
      {
        "id": "LE_3_7_basic_working_days",
        "label": "Working days (Basic Based)",
        "type": "text"
      },
      {
        "id": "LE_3_7_gross_working_days",
        "label": "Working days (Gross Based)",
        "type": "text"
      },
      {
        "id": "LE_3_7",
        "label": "Encashment calculation basis",
        "type": "radio",
        "options": [
          "CTC Based",
          "Basic Based",
          "Gross Based"
        ]
      },
      {
        "id": "LE_3_8_maximum_carry_forward_days",
        "label": "Maximum carry-forward days",
        "type": "text"
      },
      {
        "id": "LE_3_8",
        "label": "Carry-forward of unused annual leave — what is your policy?",
        "type": "radio",
        "options": [
          "No carry-forward — unused leave lapses at year end",
          "Carry-forward permitted — capped at specific days (specify below)",
          "Unlimited carry-forward",
          "Carry-forward only permitted in exceptional circumstances"
        ]
      }
    ]
  },
  {
    "name": "Retirement Age",
    "description": "This module benchmarks retirement age norms across organizations and industries, including post-retirement extension practices and talent retention implications.",
    "questions": [
      {
        "id": "RA_4_1_years",
        "label": "Years",
        "type": "text"
      },
      {
        "id": "RA_4_1",
        "label": "What is the standard retirement age in your organization for management employees?",
        "type": "radio",
        "options": [
          "Specify retirement age in years",
          "No fixed retirement age — determined by contract",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "RA_4_2",
        "label": "Is the retirement age uniform across all management grades, or does it vary?",
        "type": "radio",
        "options": [
          "Uniform — same retirement age for all management grades",
          "Varies by grade — senior grades have higher retirement age",
          "Varies by employment contract type"
        ]
      },
      {
        "id": "RA_table_4_2",
        "label": "Grade / Level",
        "type": "table",
        "columns": [
          "Retirement age",
          "Any note / exception"
        ],
        "rows": STANDARD_GRADE_TABLE_ROWS
      },
      {
        "id": "RA_4_3",
        "label": "Does your organization permit post-retirement service extension?",
        "type": "radio",
        "options": [
          "Yes — fixed extension period (e.g., up to 2 years)",
          "Yes — discretionary, subject to performance / business need",
          "No — mandatory retirement at policy age"
        ]
      },
      {
        "id": "RA_4_sub_extension_terms",
        "label": "If post-retirement extension is permitted, what are the terms?",
        "type": "text"
      },
      {
        "id": "RA_4_4",
        "label": "What is the primary driver of your retirement age policy?",
        "type": "radio",
        "options": [
          "Bangladesh Labor Law statutory requirement",
          "Parent company / global policy",
          "Industry / market norm",
          "Internal talent strategy",
          "Other — please specify"
        ],
        "hasInput": true
      }
    ]
  },
  {
    "name": "Employment Termination Notice Period",
    "description": "This module captures notice period policies across management grades for both employer-initiated and employee-initiated separations, including payment in lieu of notice practices.",
    "questions": [
      {
        "id": "ET_5_1",
        "label": "Notice Period: Employer initiated termination. Specify notice period in days or months by management grade.",
        "type": "text"
      },
      {
        "id": "ET_table_5_1",
        "label": "Grade / Level",
        "type": "table",
        "columns": [
          "Notice period (months)"
        ],
        "rows": STANDARD_GRADE_TABLE_ROWS
      },
      {
        "id": "ET_5_2",
        "label": "Notice Period: Employee initiated resignation. Specify notice period in days or months by management grade.",
        "type": "text"
      },
      {
        "id": "ET_table_5_2",
        "label": "Grade / Level",
        "type": "table",
        "columns": [
          "Notice period (months)",
          "Notes (If any)"
        ],
        "rows": STANDARD_GRADE_TABLE_ROWS
      },
      {
        "id": "ET_5_3",
        "label": "Is the notice period defined in the appointment letter / employment contract?",
        "type": "radio",
        "options": [
          "Yes — standard clause for all management employees",
          "Yes — negotiated individually for senior hires",
          "Partially — defined for some grades only",
          "No — governed by company policy document only"
        ]
      },
      {
        "id": "ET_5_4",
        "label": "Payment in lieu of notice (PILON) — is it offered?",
        "type": "radio",
        "options": [
          "Yes — always offered (employer may waive notice period with payment)",
          "Yes — at employer's discretion",
          "No — notice period must be served in full",
          "Case-by-case depending on circumstance",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "ET_5_5",
        "label": "PILON calculation basis — if payment in lieu of notice is made, what is it based on?",
        "type": "radio",
        "options": [
          "Basic salary for the notice period",
          "Gross salary for the notice period",
          "Total CTC equivalent for the notice period",
          "Not applicable — PILON not offered",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "ET_5_6",
        "label": "Garden leave — is there a policy for placing employees on garden leave during the notice period?",
        "type": "radio",
        "options": [
          "Yes — standard practice for senior / sensitive roles",
          "Yes — used occasionally on a case-by-case basis",
          "No — employees are expected to work through notice",
          "No formal policy"
        ]
      },
      {
        "id": "ET_5_7_reduced_notice",
        "label": "Reduced notice period",
        "type": "text"
      },
      {
        "id": "ET_5_7",
        "label": "What is the notice period treatment for termination for cause (gross misconduct)? (e.g. no notice / immediate termination, reduced notice of 15 days, subject to inquiry outcome)",
        "type": "radio",
        "options": [
          "No notice / PILON — immediate termination",
          "Reduced notice (specify below)",
          "Full notice applies regardless",
          "Subject to inquiry outcome — varies case-by-case"
        ]
      }
    ]
  },
  {
    "name": "Mobile Phone Set Policy",
    "description": "This module examines whether organizations provide a company-owned mobile handset as a grade-level entitlement, the equivalent cash alternative, replacement cycles, and device return protocols.",
    "questions": [
      {
        "id": "MP_6_1",
        "label": "Does your organization have a formal mobile phone set (handset) policy for management employees?",
        "type": "radio",
        "options": [
          "Yes — company-provided physical device",
          "Yes — cash equivalent allowance in lieu of device",
          "Yes — employee's choice (device or cash equivalent)",
          "No formal policy"
        ]
      },
      {
        "id": "MP_6_2",
        "label": "Mobile phone set entitlement — by management grade. For each grade, indicate entitlement type and approximate value in BDT.",
        "type": "text"
      },
      {
        "id": "MP_table_6_2",
        "label": "Grade / Level",
        "type": "table",
        "columns": [
          "Entitlement type (Device/Cash/Both)",
          "Approx. BDT value / budget",
          "Device category (e.g. flagship, mid-range)"
        ],
        "rows": STANDARD_GRADE_TABLE_ROWS
      },
      {
        "id": "MP_6_3",
        "label": "What is the device replacement / cash equivalent allowance cycle?",
        "type": "text"
      },
      {
        "id": "MP_6_4",
        "label": "On resignation or termination — what happens to the company-provided device?",
        "type": "radio",
        "options": [
          "Device must be returned to the company immediately",
          "Employee may purchase the device at depreciated book value",
          "Employee keeps device after completing a defined entitlement period",
          "Policy varies by grade",
          "Not applicable — no company device provided",
          "Other — please specify"
        ],
        "hasInput": true
      },
      {
        "id": "MP_6_5",
        "label": "Additional notes on your mobile phone set policy. Use this space to clarify any unique provisions, exceptions, or planned changes (e.g. does the company provide mobile phone as a tool of trade? If yes, then for which role?).",
        "type": "textarea"
      }
    ]
  }
];


/** Index of the first section shown as "Module 1" (Provident Fund). */
export const FIRST_NUMBERED_MODULE_INDEX = SURVEY_MODULES.findIndex(m => m.name === 'Provident Fund');

export function isNumberedSurveyModule(moduleIndex: number): boolean {
  return moduleIndex >= FIRST_NUMBERED_MODULE_INDEX && FIRST_NUMBERED_MODULE_INDEX >= 0;
}

export function getDisplayModuleNumber(moduleIndex: number): number {
  return moduleIndex - FIRST_NUMBERED_MODULE_INDEX + 1;
}

export function getNumberedModuleCount(): number {
  return SURVEY_MODULES.length - FIRST_NUMBERED_MODULE_INDEX;
}

export const ZUNOKS_CONTACT = {
  name: 'ZUNOKS Consulting',
  tagline: 'Inspire to innovate',
  phone: '+880 9678 224224',
  phoneHref: 'tel:+8809678224224',
  email: 'zunoks.consulting@zunoks.com',
  emailHref: 'mailto:zunoks.consulting@zunoks.com',
  address: 'Unit: C1, 3rd Floor, House-35/B, Road-63, Gulshan-2, Dhaka 1212, Bangladesh',
  website: 'https://www.zunoks.com/',
  linkedin: 'https://www.linkedin.com/company/zunoks',
};

export const SURVEY_META = {
  title: 'Benefits Benchmarking Survey',
  subtitle: 'Management Employee Benefits — Structured Data Collection Instrument',
  client: 'BAT Bangladesh',
  conductedBy: 'ZUNOKS Consulting',
  date: 'June 2026',
  confidentiality: 'CONFIDENTIAL & RESTRICTED — This questionnaire is issued exclusively to authorized representatives of participating organizations. All data collected is subject to strict confidentiality protocols. Individual company responses will not be disclosed. Results will be published only in anonymized, aggregated form.',
};

export const INSTRUCTIONS = [
  'Responses are for the management-level employees only (excludes factory/daily-rated workers unless explicitly stated). ',
  'Where a policy differs by management grade, please use the grade tables provided. Leave rows blank if a grade is not applicable.',
  'Select the most accurate option. Use Other — please specify where your policy does not match any listed option.',
  'Where a question refers to the Bangladesh Labor Law (2026 Amendment), indicate whether your policy meets, exceeds, or falls short of the requirement.',
  'In case of any difficulties, please email mashiat@zunoks.com.',
];
