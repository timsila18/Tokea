"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Download, Plus, Save, Upload } from "lucide-react";
import {
  OrganizerActionForm,
  type OrganizerAction,
} from "@/components/OrganizerActionForm";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Module = {
  title: string;
  description: string;
  action: string;
  metrics: [string, string][];
  rows: [string, string, string][];
};
type ActiveOrganizerAction = {
  action: OrganizerAction;
  initialFields?: Record<string, string>;
};
type OrganizerReport = {
  title: string;
  cadence: string;
  audience: string;
  insight: string;
  metrics: [string, string][];
};
type WizardTicketRow = { name: string; priceKes: string; quantity: string };
type WizardScheduleRow = {
  title: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  locationLabel: string;
  description: string;
};
type WizardFoodoRow = {
  vendorName: string;
  cuisineType: string;
  vendorFeeKes: string;
  stallNumber: string;
  location: string;
  menuSummary: string;
  requirements: string;
};
type WizardSponsorRow = {
  name: string;
  priceKes: string;
  inventory: string;
  benefits: string;
};
type WizardStaffRow = {
  email: string;
  roleTitle: string;
  department: string;
  shiftStart: string;
  shiftEnd: string;
};
type WizardVolunteerRow = {
  title: string;
  requiredCount: string;
  volunteerEmail: string;
  shiftStart: string;
  shiftEnd: string;
  description: string;
};
type WizardBudgetRow = { category: string; budgetKes: string; notes: string };
type WizardCampaignRow = {
  name: string;
  channel: string;
  objective: string;
  contentFormat: string;
  cta: string;
  trackingCode: string;
  startsAt: string;
  endsAt: string;
  message: string;
};

const modules: Record<string, Module> = {
  events: {
    title: "My Events",
    description:
      "Monitor every draft, live, upcoming, completed, and cancelled event.",
    action: "Create event",
    metrics: [
      ["Published", "2"],
      ["Drafts", "1"],
      ["Ticket revenue", "KES 642K"],
    ],
    rows: [
      ["Nairobi Gospel Night", "15 Jul 2026 - KICC", "42% ready"],
      ["Campus Amapiano Festival", "30 Aug 2026 - Carnivore", "Draft"],
      ["Tech Founders Summit", "12 Sep 2026 - Sarit", "61% ready"],
    ],
  },
  ticketing: {
    title: "Ticketing",
    description:
      "Manage ticket types, promo codes, affiliates, sales, refunds, transfers, and check-ins.",
    action: "Create ticket type",
    metrics: [
      ["Sold today", "64"],
      ["Sales this week", "286"],
      ["Conversion", "4.8%"],
    ],
    rows: [
      ["Early Bird", "1,040 sold - KES 2,500", "Active"],
      ["VIP", "205 sold - KES 6,500", "Selling fast"],
      ["Regular", "0 sold - KES 3,500", "Scheduled"],
    ],
  },
  marketing: {
    title: "Marketing Center",
    description:
      "Create campaigns, announcements, reels, social posts, and share-ready event links.",
    action: "Create campaign",
    metrics: [
      ["Reach", "86.4K"],
      ["Interested", "1,862"],
      ["Promo conversions", "198"],
    ],
    rows: [
      ["Instagram reel", "24.8K views - 1.9K likes", "Top performing"],
      ["WhatsApp launch", "4.2% conversion", "Active"],
      ["Campus creator code", "54 ticket sales", "Active"],
    ],
  },
  operations: {
    title: "Operations Center",
    description:
      "Assign work, control approvals, track deadlines, logistics, incidents, and event readiness.",
    action: "Create task",
    metrics: [
      ["Tasks complete", "38 / 52"],
      ["Overdue", "4"],
      ["Approvals", "7"],
    ],
    rows: [
      ["Security coverage", "Owner: Operations lead", "Blocked"],
      ["Gate scanner test", "Owner: Ticketing lead", "Due 12 Jul"],
      ["Vendor confirmation", "Owner: Vendor lead", "In progress"],
    ],
  },
  staff: {
    title: "Staff Management",
    description:
      "Define roles, invite staff, assign shifts, track attendance, and connect the workforce foundation.",
    action: "Invite staff",
    metrics: [
      ["Required", "24"],
      ["Assigned", "18"],
      ["Shift coverage", "75%"],
    ],
    rows: [
      ["Security", "6 / 8 assigned", "Needs action"],
      ["Gate scanners", "4 / 4 assigned", "Covered"],
      ["VIP hosts", "2 / 4 assigned", "Needs action"],
    ],
  },
  volunteers: {
    title: "Volunteer Management",
    description:
      "Review applications, assign tasks, track service hours, and issue certificates.",
    action: "Create opportunity",
    metrics: [
      ["Applications", "31"],
      ["Approved", "12"],
      ["Hours planned", "246"],
    ],
    rows: [
      ["Guest experience", "8 approved", "Open"],
      ["Community support", "3 approved", "Open"],
      ["Green team", "1 approved", "Needs action"],
    ],
  },
  vendors: {
    title: "Vendor Management",
    description:
      "Source service vendors, request quotes, approve contracts, and track vendor deliverables.",
    action: "Find vendors",
    metrics: [
      ["Applications", "8"],
      ["Awaiting review", "3"],
      ["Confirmed", "5"],
    ],
    rows: [
      ["Stage and sound", "Quote received", "Review"],
      ["Security provider", "Contract pending", "Action needed"],
      ["Photo and video", "Confirmed", "Ready"],
    ],
  },
  foodo: {
    title: "Foodo Management",
    description:
      "Approve food vendors, allocate stalls, review menus, and monitor food pre-orders and redemptions.",
    action: "Activate Foodo",
    metrics: [
      ["Approved vendors", "6"],
      ["Pending menus", "2"],
      ["Pre-orders", "184"],
    ],
    rows: [
      ["Urban Bites", "Stall A12 - Menu approved", "Ready"],
      ["Mama Njeri Kitchen", "Compliance pending", "Review"],
      ["Wok House", "Stall B02 - 64 pre-orders", "Ready"],
    ],
  },
  triplink: {
    title: "Triplink Management",
    description:
      "Configure routes, pickup points, vehicles, manifests, boarding, and transport revenue.",
    action: "Create route",
    metrics: [
      ["Routes", "0"],
      ["Pickup points", "0"],
      ["Seats booked", "0"],
    ],
    rows: [
      ["CBD express", "Not configured", "Action needed"],
      ["Thika Road", "Not configured", "Action needed"],
      ["Westlands", "Not configured", "Action needed"],
    ],
  },
  sponsors: {
    title: "Sponsor Management",
    description:
      "Build packages, send proposals, approve sponsors, and deliver every commercial commitment.",
    action: "Create package",
    metrics: [
      ["Secured", "2"],
      ["Proposals open", "4"],
      ["Sponsor revenue", "KES 180K"],
    ],
    rows: [
      ["Main stage partner", "KES 120,000 - Signed", "Ready"],
      ["Beverage partner", "KES 60,000 - Signed", "Ready"],
      ["Connectivity partner", "Proposal sent", "Follow up"],
    ],
  },
  finance: {
    title: "Finance",
    description:
      "Track revenue, expenses, budgets, fees, settlements, payouts, and event profit.",
    action: "Create budget line",
    metrics: [
      ["Gross revenue", "KES 642K"],
      ["Expenses", "KES 358K"],
      ["Projected profit", "KES 284K"],
    ],
    rows: [
      ["Venue deposit", "KES 120,000", "Paid"],
      ["Production", "KES 88,000", "On budget"],
      ["Marketing", "KES 65,000", "Under budget"],
    ],
  },
  analytics: {
    title: "Analytics",
    description:
      "Understand sales trends, audience growth, conversion, community activity, and partner performance.",
    action: "Export report",
    metrics: [
      ["Sales velocity", "+18.7%"],
      ["New followers", "842"],
      ["Community posts", "128"],
    ],
    rows: [
      ["Instagram", "42% of event traffic", "Top source"],
      ["WhatsApp", "26% of event traffic", "High conversion"],
      ["Affiliate codes", "18% of ticket sales", "Growing"],
    ],
  },
  solco: {
    title: "Solco Workspace",
    description:
      "Coordinate the event team through channels, announcements, meetings, files, and pinned decisions.",
    action: "Open workspace",
    metrics: [
      ["Channels", "9"],
      ["Unread messages", "14"],
      ["Meetings this week", "3"],
    ],
    rows: [
      ["# operations", "4 unread - Gate plan updated", "Active"],
      ["# announcements", "2 scheduled updates", "Active"],
      ["# emergency", "Safety briefing pinned", "Ready"],
    ],
  },
  documents: {
    title: "Documents",
    description:
      "Store permits, contracts, invoices, emergency plans, insurance, and partner agreements.",
    action: "Upload document",
    metrics: [
      ["Stored", "18"],
      ["Awaiting upload", "4"],
      ["Expiring soon", "1"],
    ],
    rows: [
      ["Venue agreement", "PDF - KICC", "Verified"],
      ["Emergency plan", "Missing", "Action needed"],
      ["Insurance certificate", "Expires 16 Jul 2026", "Review"],
    ],
  },
  settings: {
    title: "Organization Settings",
    description:
      "Manage the organization profile, team permissions, payout details, verification, notifications, and security.",
    action: "Edit organization",
    metrics: [
      ["Team members", "8"],
      ["Verified", "Pending"],
      ["Security checks", "6 / 7"],
    ],
    rows: [
      ["Organization profile", "Tokea Events Kenya", "Complete"],
      ["Payout account", "Equity Bank - **** 4231", "Verified"],
      ["Two-step verification", "Not enabled", "Action needed"],
    ],
  },
};

const wizardSteps = [
  "Basic details",
  "Venue",
  "Media",
  "Schedule",
  "Tickets",
  "Foodo",
  "Triplink",
  "Staff",
  "Volunteers",
  "Sponsors",
  "Budget",
  "Marketing",
  "Preview",
];
const standardTicketTypes = [
  "Regular",
  "VIP",
  "VVIP",
  "Regular Group of 5",
  "Gate Regular",
];
const eventCategories = [
  "Music",
  "Gospel",
  "Sports",
  "Business",
  "Technology",
  "Fashion",
  "Comedy",
  "Festivals",
  "Conferences",
  "Nightlife",
];
const venueSuggestions = [
  "KICC",
  "Uhuru Gardens",
  "The Carnivore Grounds",
  "Sarit Expo Centre",
  "Two Rivers Mall",
  "The Hub Karen",
  "Kenyatta Stadium",
  "Nairobi Street Kitchen",
  "Bomas of Kenya",
  "The Standup Lounge",
];
const cityOptions = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Naivasha",
  "Thika",
  "Machakos",
  "Diani",
  "Nanyuki",
];
const eventNameSuggestions = [
  "Blankets & Wine Nairobi",
  "Nairobi Gospel Night",
  "Koroga Festival 2026",
  "Campus Amapiano Festival",
  "Tech Founders Summit",
];
const scheduleTitleSuggestions = [
  "Gates open",
  "Opening act",
  "Headline performance",
  "VIP check-in",
  "After party",
  "Main programme",
];
const wizardScheduleDefaults: WizardScheduleRow[] = [
  {
    title: "Gates open",
    scheduleDate: "",
    startTime: "",
    endTime: "",
    locationLabel: "Main gate",
    description: "Guest arrival and ticket scanning starts.",
  },
  {
    title: "VIP check-in",
    scheduleDate: "",
    startTime: "",
    endTime: "",
    locationLabel: "VIP entrance",
    description: "VIP guests check in and move to reserved areas.",
  },
  {
    title: "Headline performance",
    scheduleDate: "",
    startTime: "",
    endTime: "",
    locationLabel: "Main stage",
    description: "Main act goes live.",
  },
];
const wizardTicketDefaults: WizardTicketRow[] = [
  { name: "Regular", priceKes: "2500", quantity: "500" },
  { name: "VIP", priceKes: "6500", quantity: "150" },
  { name: "VVIP", priceKes: "12000", quantity: "50" },
  { name: "Regular Group of 5", priceKes: "11000", quantity: "80" },
  { name: "Gate Regular", priceKes: "3000", quantity: "300" },
];
const foodoCuisineSuggestions = [
  "Nyama choma",
  "Cocktails",
  "Street food",
  "Coffee and dessert",
  "VIP lounge catering",
  "Swahili dishes",
  "Vegan and healthy",
  "BBQ and grills",
];
const wizardFoodoDefaults: WizardFoodoRow[] = [
  {
    vendorName: "Urban Bites",
    cuisineType: "Street food",
    vendorFeeKes: "15000",
    stallNumber: "F1",
    location: "Food court",
    menuSummary: "Loaded fries, burgers, wraps, and soft drinks.",
    requirements:
      "Tent, power point, water access, waste bin, and two vendor passes.",
  },
  {
    vendorName: "Mama Njeri Kitchen",
    cuisineType: "Nyama choma",
    vendorFeeKes: "18000",
    stallNumber: "F2",
    location: "Grill zone",
    menuSummary: "Nyama choma, mutura, kachumbari, ugali, and sauces.",
    requirements:
      "Grill clearance, fire safety check, water access, and waste handling.",
  },
];
const wizardSponsorDefaults: WizardSponsorRow[] = [
  {
    name: "Gold Partner",
    priceKes: "250000",
    inventory: "3",
    benefits:
      "Logo on event poster\nStage mentions\nVIP tickets\nSocial media feature",
  },
  {
    name: "Beverage Partner",
    priceKes: "150000",
    inventory: "2",
    benefits: "Brand booth\nPouring rights\nSocial media feature",
  },
];
const sponsorshipPackages = [
  "Title Partner",
  "Gold Partner",
  "Silver Partner",
  "Bronze Partner",
  "Stage Partner",
  "Beverage Partner",
  "Connectivity Partner",
  "Media Partner",
];
const staffRoleSuggestions = [
  "Security Lead",
  "Security Guard",
  "Gate Scanner",
  "Usher",
  "VIP Host",
  "Customer Support",
  "Media Crew",
  "Stage Manager",
  "Backstage Assistant",
  "Parking Attendant",
  "Medical Desk Lead",
  "Artist Liaison",
];
const staffDepartmentOptions = [
  ["security", "Security"],
  ["ushers", "Ushers"],
  ["ticket_scanners", "Ticket scanners"],
  ["parking_staff", "Parking staff"],
  ["cleaners", "Cleaners"],
  ["media_team", "Media team"],
  ["photographers", "Photographers"],
  ["videographers", "Videographers"],
  ["mc_team", "MC team"],
  ["vip_coordinators", "VIP coordinators"],
  ["customer_support", "Customer support"],
  ["backstage_staff", "Backstage staff"],
  ["operations_team", "Operations team"],
];
const wizardStaffDefaults: WizardStaffRow[] = [
  {
    email: "",
    roleTitle: "Security Lead",
    department: "security",
    shiftStart: "",
    shiftEnd: "",
  },
  {
    email: "",
    roleTitle: "Gate Scanner",
    department: "ticket_scanners",
    shiftStart: "",
    shiftEnd: "",
  },
  {
    email: "",
    roleTitle: "VIP Host",
    department: "vip_coordinators",
    shiftStart: "",
    shiftEnd: "",
  },
];
const volunteerRoleSuggestions = [
  "Guest experience team",
  "Green team",
  "Information desk",
  "Lost and found",
  "Queue marshals",
  "Photo runners",
  "Artist hospitality",
  "Community support",
];
const wizardVolunteerDefaults: WizardVolunteerRow[] = [
  {
    title: "Guest experience team",
    requiredCount: "10",
    volunteerEmail: "",
    shiftStart: "",
    shiftEnd: "",
    description:
      "Welcome guests, guide queues, and help people find gates, seats, and support points.",
  },
  {
    title: "Information desk",
    requiredCount: "4",
    volunteerEmail: "",
    shiftStart: "",
    shiftEnd: "",
    description:
      "Answer guest questions and direct people to tickets, Foodo, Triplink, and lost and found.",
  },
];
const budgetCategories = [
  "Venue",
  "Production",
  "Security",
  "Marketing",
  "Talent",
  "Staffing",
  "Foodo setup",
  "Triplink transport",
  "Permits",
  "Insurance",
  "Contingency",
];
const wizardBudgetDefaults: WizardBudgetRow[] = [
  {
    category: "Venue",
    budgetKes: "120000",
    notes: "Deposit, venue balance, cleaning, and venue compliance.",
  },
  {
    category: "Production",
    budgetKes: "88000",
    notes: "Stage, sound, lights, screens, and technical crew.",
  },
  {
    category: "Security",
    budgetKes: "60000",
    notes: "Security staff, scanners, emergency response, and crowd control.",
  },
  {
    category: "Marketing",
    budgetKes: "65000",
    notes: "Creative, social boosts, creators, radio, and campus ambassadors.",
  },
];
const campaignNames = [
  "Launch campaign",
  "Early bird push",
  "Final week sales",
  "VIP table push",
  "Influencer reel burst",
  "Last-call reminder",
];
const campaignChannels = [
  "Instagram",
  "TikTok",
  "WhatsApp",
  "Facebook",
  "X",
  "Telegram",
  "Radio",
  "Campus ambassadors",
];
const campaignObjectives = [
  "Awareness",
  "Interested saves",
  "Ticket conversion",
  "VIP upsell",
  "Community growth",
  "Last-call urgency",
];
const campaignFormats = [
  "Poster carousel + reel",
  "Short-form video",
  "Broadcast copy + short link",
  "Story countdown",
  "Creator brief",
  "Radio mention",
];
const campaignCtas = [
  "Save event",
  "Buy ticket",
  "Share with friends",
  "Join community",
  "Book VIP",
  "Use creator code",
];
const wizardCampaignDefaults: WizardCampaignRow[] = [
  {
    name: "Launch campaign",
    channel: "Instagram",
    objective: "Awareness",
    contentFormat: "Poster carousel + reel",
    cta: "Save event",
    trackingCode: "IG-LAUNCH",
    startsAt: "",
    endsAt: "",
    message:
      "Introduce the event with poster, date, venue, ticket-from price, and a save/share CTA.",
  },
  {
    name: "Early bird push",
    channel: "WhatsApp",
    objective: "Ticket conversion",
    contentFormat: "Broadcast copy + short link",
    cta: "Buy ticket",
    trackingCode: "WA-EARLY",
    startsAt: "",
    endsAt: "",
    message:
      "Send a direct sales message with early bird deadline, price, and Tokea ticket link.",
  },
  {
    name: "Influencer reel burst",
    channel: "TikTok",
    objective: "Community growth",
    contentFormat: "Short-form video",
    cta: "Join community",
    trackingCode: "TT-CREATOR",
    startsAt: "",
    endsAt: "",
    message:
      "Use creator clips, venue energy, artist teasers, and a community join CTA.",
  },
];
type WizardField = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "time" | "datetime-local" | "select";
  placeholder?: string;
  options?: string[];
  full?: boolean;
  defaultValue?: string;
};

type WizardStepConfig = {
  guidance: string;
  fields: WizardField[];
};

const wizardSuggestions: Record<number, WizardStepConfig> = {
  3: {
    guidance:
      "Build the run-of-show quickly with suggested programme titles and real schedule pickers.",
    fields: [
      {
        name: "scheduleTitle",
        label: "Schedule title",
        type: "select",
        options: scheduleTitleSuggestions,
        defaultValue: "Gates open",
      },
      { name: "scheduleDate", label: "Schedule date", type: "date" },
      { name: "scheduleStartTime", label: "Start time", type: "time" },
      { name: "scheduleEndTime", label: "End time", type: "time" },
    ],
  },
  5: {
    guidance:
      "Choose the Foodo setup instead of typing from scratch, then add the commercial basics.",
    fields: [
      {
        name: "foodoBrief",
        label: "Foodo brief",
        type: "select",
        options: [
          "Nyama choma village",
          "Cocktail bars",
          "Street food court",
          "Coffee and dessert vendors",
          "VIP lounge catering",
        ],
        defaultValue: "Street food court",
      },
      {
        name: "vendorFeeKes",
        label: "Vendor fee (KES)",
        type: "number",
        placeholder: "15000",
      },
      {
        name: "foodVendorCount",
        label: "Vendor slots",
        type: "number",
        placeholder: "12",
      },
      {
        name: "menuDeadline",
        label: "Menu submission deadline",
        type: "datetime-local",
      },
    ],
  },
  6: {
    guidance:
      "Pick common Nairobi pickup routes, then set seats and departure timing.",
    fields: [
      {
        name: "pickupPoints",
        label: "Pickup points",
        type: "select",
        options: [
          "CBD, Westlands, Kilimani",
          "Thika Road, Kasarani, Roysambu",
          "Ngong Road, Junction, Karen",
          "Mombasa Road, South B, South C",
          "Kiambu Road, Ridgeways, Runda",
        ],
        defaultValue: "CBD, Westlands, Kilimani",
      },
      {
        name: "seatsRequired",
        label: "Seats required",
        type: "number",
        placeholder: "100",
      },
      {
        name: "firstDeparture",
        label: "First departure",
        type: "datetime-local",
      },
      {
        name: "returnDeparture",
        label: "Return departure",
        type: "datetime-local",
      },
    ],
  },
  7: {
    guidance:
      "Select the staff mix your floor team needs and set shift coverage.",
    fields: [
      {
        name: "staffRoles",
        label: "Staff roles required",
        type: "select",
        options: [
          "Security, ushers, scanners",
          "VIP hosts, gate scanners, media crew",
          "Parking, sanitation, medical desk",
          "Backstage, runners, artist liaison",
        ],
        defaultValue: "Security, ushers, scanners",
      },
      {
        name: "staffTarget",
        label: "Staff target",
        type: "number",
        placeholder: "20",
      },
      { name: "staffShiftStart", label: "Shift start", type: "datetime-local" },
      { name: "staffShiftEnd", label: "Shift end", type: "datetime-local" },
    ],
  },
  8: {
    guidance:
      "Publish volunteer opportunities with role suggestions and shift timing.",
    fields: [
      {
        name: "volunteerOpportunity",
        label: "Volunteer role",
        type: "select",
        options: [
          "Guest experience team",
          "Green team",
          "Information desk",
          "Lost and found",
          "Queue marshals",
          "Photo runners",
        ],
        defaultValue: "Guest experience team",
      },
      {
        name: "volunteersRequired",
        label: "Volunteers required",
        type: "number",
        placeholder: "10",
      },
      {
        name: "volunteerShiftStart",
        label: "Shift start",
        type: "datetime-local",
      },
      { name: "volunteerShiftEnd", label: "Shift end", type: "datetime-local" },
    ],
  },
  9: {
    guidance:
      "Choose a sponsor package tier and capture the value in one step.",
    fields: [
      {
        name: "sponsorshipPackage",
        label: "Sponsorship package",
        type: "select",
        options: [
          "Title Partner",
          "Gold Partner",
          "Silver Partner",
          "Bronze Partner",
          "Stage Partner",
          "Beverage Partner",
          "Media Partner",
        ],
        defaultValue: "Gold Partner",
      },
      {
        name: "packageValueKes",
        label: "Package value (KES)",
        type: "number",
        placeholder: "250000",
      },
      {
        name: "sponsorInventory",
        label: "Packages available",
        type: "number",
        placeholder: "3",
      },
    ],
  },
  10: {
    guidance: "Use standard event budget categories so finance stays clean.",
    fields: [
      {
        name: "budgetCategory",
        label: "Budget category",
        type: "select",
        options: [
          "Venue",
          "Production",
          "Security",
          "Marketing",
          "Talent",
          "Staffing",
          "Foodo setup",
          "Triplink transport",
          "Permits",
          "Insurance",
          "Contingency",
        ],
        defaultValue: "Production",
      },
      {
        name: "budgetKes",
        label: "Budget (KES)",
        type: "number",
        placeholder: "85000",
      },
    ],
  },
  11: {
    guidance:
      "Create one or more campaign pushes: awareness first, conversion second, and final reminders before event day.",
    fields: [
      {
        name: "campaignName",
        label: "Campaign name",
        type: "select",
        options: [
          "Launch campaign",
          "Early bird push",
          "Final week sales",
          "VIP table push",
          "Influencer reel burst",
        ],
        defaultValue: "Launch campaign",
      },
      {
        name: "primaryChannel",
        label: "Primary channel",
        type: "select",
        options: [
          "Instagram",
          "TikTok",
          "WhatsApp",
          "Facebook",
          "X",
          "Telegram",
          "Radio",
          "Campus ambassadors",
        ],
        defaultValue: "Instagram",
      },
      {
        name: "campaignObjective",
        label: "Objective",
        type: "select",
        options: [
          "Awareness",
          "Interested saves",
          "Ticket conversion",
          "VIP upsell",
          "Community growth",
          "Last-call urgency",
        ],
        defaultValue: "Awareness",
      },
      {
        name: "campaignFormat",
        label: "Content format",
        type: "select",
        options: [
          "Poster carousel + reel",
          "Short-form video",
          "Broadcast copy + short link",
          "Story countdown",
          "Creator brief",
          "Radio mention",
        ],
        defaultValue: "Poster carousel + reel",
      },
      {
        name: "campaignCta",
        label: "Call to action",
        type: "select",
        options: [
          "Save event",
          "Buy ticket",
          "Share with friends",
          "Join community",
          "Book VIP",
          "Use creator code",
        ],
        defaultValue: "Save event",
      },
      {
        name: "trackingCode",
        label: "Tracking code",
        type: "text",
        placeholder: "IG-LAUNCH",
      },
      {
        name: "campaignStart",
        label: "Campaign start",
        type: "datetime-local",
      },
      { name: "campaignEnd", label: "Campaign end", type: "datetime-local" },
    ],
  },
};

const workflowActions: Record<string, OrganizerAction> = {
  ticketing: "ticket_type",
  marketing: "campaign",
  operations: "task",
  staff: "staff_invite",
  volunteers: "volunteer_opportunity",
  vendors: "vendor_request",
  foodo: "foodo",
  triplink: "triplink_route",
  sponsors: "sponsorship_package",
  finance: "budget",
  solco: "workspace",
  documents: "task",
  settings: "organization",
};
const wizardWorkflowActions: Partial<Record<number, OrganizerAction>> = {
  3: "event_schedule",
  4: "ticket_type",
  5: "foodo",
  6: "triplink_route",
  7: "staff_invite",
  8: "volunteer_opportunity",
  9: "sponsorship_package",
  10: "budget",
  11: "campaign",
};

const marketingChannelUses = [
  [
    "Instagram",
    "Premium posters, carousels, Stories, countdowns, and Reels for visual hype and saves.",
  ],
  [
    "TikTok",
    "Short event trailers, creator clips, venue previews, and trend-led discovery for younger audiences.",
  ],
  [
    "WhatsApp",
    "Conversion-focused broadcast copy, share links, group reminders, and last-call ticket pushes.",
  ],
  [
    "Facebook",
    "Event listings, community groups, retargeting audiences, and longer organizer updates.",
  ],
  [
    "X",
    "Fast announcements, lineup reveals, public conversation, and live event-day updates.",
  ],
  [
    "Telegram",
    "Community drops, deal alerts, and broadcast-style updates for loyal event communities.",
  ],
  [
    "Radio",
    "Mass awareness and credibility for citywide events, festivals, gospel, comedy, and concerts.",
  ],
  [
    "Campus ambassadors",
    "Creator codes and field promotion for student-heavy events and youth culture.",
  ],
];

const organizerReports: OrganizerReport[] = [
  {
    title: "Executive Event Snapshot",
    cadence: "Daily during campaign, hourly on event day",
    audience: "Organizer directors and investors",
    insight:
      "One page view of sales, attendance, readiness, revenue, risk, and next actions.",
    metrics: [
      ["Gross revenue", "KES 642K"],
      ["Tickets sold", "1,245"],
      ["Readiness", "78%"],
    ],
  },
  {
    title: "Ticket Sales & Conversion",
    cadence: "Daily",
    audience: "Ticketing and marketing leads",
    insight:
      "Shows sales by ticket type, sales velocity, abandoned checkouts, promo code performance, and remaining inventory.",
    metrics: [
      ["Conversion", "4.8%"],
      ["VIP sold", "205"],
      ["Inventory left", "38%"],
    ],
  },
  {
    title: "Revenue, Fees & Payouts",
    cadence: "Daily and after settlement",
    audience: "Finance and organizer owners",
    insight:
      "Tracks gross revenue, platform fees, M-Pesa reconciliation, refunds, expenses, payout requests, and projected profit.",
    metrics: [
      ["Net projection", "KES 284K"],
      ["Payout queue", "2"],
      ["Refund risk", "1.2%"],
    ],
  },
  {
    title: "Marketing Attribution",
    cadence: "After each campaign push",
    audience: "Growth team",
    insight:
      "Compares Instagram, TikTok, WhatsApp, Facebook, creator codes, and radio against clicks, saves, interested users, and purchases.",
    metrics: [
      ["Top source", "Instagram"],
      ["Promo sales", "198"],
      ["Interested", "1,862"],
    ],
  },
  {
    title: "Audience & Community",
    cadence: "Weekly and post-event",
    audience: "Experience and community teams",
    insight:
      "Reports saved events, going/interested counts, attendee location, comments, community posts, reviews, photos, and sentiment.",
    metrics: [
      ["Community posts", "128"],
      ["Going", "1,245"],
      ["Rating", "4.7"],
    ],
  },
  {
    title: "Operations Readiness",
    cadence: "Every planning meeting",
    audience: "Operations lead",
    insight:
      "Checks venue readiness, permits, vendors, gates, scanner tests, emergency exits, production tasks, and blocked work.",
    metrics: [
      ["Tasks done", "38 / 52"],
      ["Blocked", "4"],
      ["Approvals", "7"],
    ],
  },
  {
    title: "Staffing & Attendance",
    cadence: "Daily in final week, live on event day",
    audience: "Workforce lead",
    insight:
      "Shows required roles, assigned staff, shift coverage, check-ins, late arrivals, missed shifts, tasks completed, and incidents.",
    metrics: [
      ["Assigned", "18 / 24"],
      ["Attendance", "96%"],
      ["Incidents", "2"],
    ],
  },
  {
    title: "Vendor, Foodo & Triplink",
    cadence: "Weekly, then event day",
    audience: "Partner operations",
    insight:
      "Summarizes vendor approvals, Foodo stall readiness, menus, transport routes, seats booked, pickup points, and partner issues.",
    metrics: [
      ["Food vendors", "6"],
      ["Routes", "3"],
      ["Seats booked", "184"],
    ],
  },
  {
    title: "Sponsor Delivery",
    cadence: "Weekly and post-event",
    audience: "Commercial team and sponsors",
    insight:
      "Tracks sponsor packages, deliverables, social mentions, booth placements, impressions, photos, and proof-of-performance.",
    metrics: [
      ["Secured", "KES 180K"],
      ["Deliverables", "82%"],
      ["Open proposals", "4"],
    ],
  },
  {
    title: "Post-Event Performance Pack",
    cadence: "24-72 hours after event",
    audience: "Organizer, sponsors, venue, and investors",
    insight:
      "A premium closeout report combining revenue, attendance, reviews, media, operations, incidents, sponsor proof, and recommendations.",
    metrics: [
      ["Attendance", "1,184"],
      ["NPS", "68"],
      ["Next event leads", "412"],
    ],
  },
];

export function OrganizerWorkspace({ module }: { module: string }) {
  if (module === "create") return <CreateEventWizard />;

  const config = modules[module] ?? modules.events;
  const [filter, setFilter] = useState("All");
  const [activeAction, setActiveAction] =
    useState<ActiveOrganizerAction | null>(null);
  const rows = useMemo(
    () =>
      filter === "All"
        ? config.rows
        : config.rows.filter((row) =>
            row[2].toLowerCase().includes(filter.toLowerCase()),
          ),
    [config.rows, filter],
  );

  function exportReport() {
    const report =
      module === "analytics"
        ? [
            "Report,Cadence,Audience,Key Insight,Metric 1,Metric 2,Metric 3",
            ...organizerReports.map((item) =>
              [
                item.title,
                item.cadence,
                item.audience,
                item.insight,
                ...item.metrics.map(([label, value]) => `${label}: ${value}`),
              ]
                .map(csvCell)
                .join(","),
            ),
          ].join("\n")
        : [
            "Metric,Value",
            ...config.metrics.map(([label, value]) => `${label},${value}`),
          ].join("\n");
    const url = URL.createObjectURL(new Blob([report], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download =
      module === "analytics"
        ? "tokea-organizer-report-suite.csv"
        : "tokea-organizer-analytics.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const action = workflowActions[module];

  function campaignFieldsForRow(row: [string, string, string]) {
    const [name] = row;
    if (name.toLowerCase().includes("whatsapp")) {
      return {
        campaigns: JSON.stringify([
          {
            name: "Final week sales",
            channel: "WhatsApp",
            objective: "Ticket conversion",
            contentFormat: "Broadcast copy + short link",
            cta: "Buy ticket",
            destinationUrl: "https://tokeaevents.co.ke/events/your-event",
            trackingCode: "WA-FINAL",
            startsAt: "",
            endsAt: "",
            message:
              "Send a concise WhatsApp reminder with price, date, venue, urgency, and the Tokea ticket link.",
          },
        ]),
      };
    }
    if (
      name.toLowerCase().includes("creator") ||
      name.toLowerCase().includes("campus")
    ) {
      return {
        campaigns: JSON.stringify([
          {
            name: "Campus creator code",
            channel: "Campus ambassadors",
            objective: "Ticket conversion",
            contentFormat: "Creator brief",
            cta: "Use creator code",
            destinationUrl: "https://tokeaevents.co.ke/events/your-event",
            trackingCode: "CAMPUS-CODE",
            startsAt: "",
            endsAt: "",
            message:
              "Assign creator codes, campus posters, and story templates so sales can be traced per ambassador.",
          },
        ]),
      };
    }
    return {
      campaigns: JSON.stringify([
        {
          name: "Influencer reel burst",
          channel: "Instagram",
          objective: "Awareness",
          contentFormat: "Short-form video",
          cta: "Save event",
          destinationUrl: "https://tokeaevents.co.ke/events/your-event",
          trackingCode: "IG-REEL",
          startsAt: "",
          endsAt: "",
          message:
            "Post a punchy Reel using the poster, venue shots, artist clips, ticket price, and event link.",
        },
      ]),
    };
  }

  function openRowAction(row: [string, string, string]) {
    if (module === "analytics") {
      exportReport();
      return;
    }
    if (action)
      setActiveAction({
        action,
        initialFields:
          module === "marketing" ? campaignFieldsForRow(row) : undefined,
      });
  }

  return (
    <div className="organizer-workspace">
      <header className="organizer-header">
        <div>
          <p className="section-kicker">Organizer workspace</p>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        {module === "events" ? (
          <Link href="/dashboard/organizer/create" className="button">
            <Plus size={16} />
            {config.action}
          </Link>
        ) : module === "analytics" ? (
          <button className="button" type="button" onClick={exportReport}>
            <Download size={16} />
            {config.action}
          </button>
        ) : (
          <button
            className="button"
            type="button"
            onClick={() => setActiveAction({ action })}
          >
            <Plus size={16} />
            {config.action}
          </button>
        )}
      </header>
      <div className="workspace-metrics">
        {config.metrics.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <section className="organizer-panel workspace-table">
        <div className="panel-heading">
          <h2>Current activity</h2>
          <div className="compact-tabs">
            {["All", "Ready", "Action needed"].map((item) => (
              <button
                className={filter === item ? "active" : ""}
                key={item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Details</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                <td>
                  <strong>{row[0]}</strong>
                </td>
                <td>{row[1]}</td>
                <td>
                  <span className="status">{row[2]}</span>
                </td>
                <td>
                  {module === "events" ? (
                    <Link
                      className="row-action-button"
                      href="/dashboard/organizer/create"
                      aria-label={`Continue setup for ${row[0]}`}
                      title={`Continue setup for ${row[0]}`}
                    >
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button
                      className="row-action-button"
                      type="button"
                      onClick={() => openRowAction(row)}
                      aria-label={`Open ${config.action} for ${row[0]}`}
                      title={`Open ${config.action} for ${row[0]}`}
                    >
                      <ArrowRight size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {module === "analytics" && (
        <OrganizerReportSuite onExport={exportReport} />
      )}
      {activeAction && (
        <OrganizerActionForm
          action={activeAction.action}
          initialFields={activeAction.initialFields}
          onClose={() => setActiveAction(null)}
        />
      )}
    </div>
  );
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function OrganizerReportSuite({ onExport }: { onExport: () => void }) {
  return (
    <section className="organizer-report-suite">
      <div className="report-suite-head">
        <div>
          <p className="section-kicker">Organizer intelligence</p>
          <h2>Premium Report Suite</h2>
          <p>
            Classy board-pack style reports for planning meetings, event-day
            command, sponsor updates, and post-event closeout.
          </p>
        </div>
        <div>
          <button
            className="button secondary"
            type="button"
            onClick={() => window.print()}
          >
            <Download size={16} />
            Print pack
          </button>
          <button className="button" type="button" onClick={onExport}>
            <Download size={16} />
            Export data
          </button>
        </div>
      </div>
      <div className="report-card-grid">
        {organizerReports.map((report, index) => (
          <article className="report-card" key={report.title}>
            <div className="report-number">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div>
              <span>{report.cadence}</span>
              <h3>{report.title}</h3>
              <p>{report.insight}</p>
              <small>For: {report.audience}</small>
            </div>
            <dl>
              {report.metrics.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function CreateEventWizard() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [step, setStep] = useState(0);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [activeAction, setActiveAction] = useState<OrganizerAction | null>(
    null,
  );
  const [galleryFiles, setGalleryFiles] = useState<
    { file: File; previewUrl: string }[]
  >([]);
  const [scheduleRows, setScheduleRows] = useState<WizardScheduleRow[]>(
    wizardScheduleDefaults,
  );
  const [ticketRows, setTicketRows] =
    useState<WizardTicketRow[]>(wizardTicketDefaults);
  const [foodoRows, setFoodoRows] =
    useState<WizardFoodoRow[]>(wizardFoodoDefaults);
  const [ticketSalesStart, setTicketSalesStart] = useState("");
  const [ticketSalesEnd, setTicketSalesEnd] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [sponsorRows, setSponsorRows] = useState<WizardSponsorRow[]>(
    wizardSponsorDefaults,
  );
  const [staffRows, setStaffRows] =
    useState<WizardStaffRow[]>(wizardStaffDefaults);
  const [volunteerRows, setVolunteerRows] = useState<WizardVolunteerRow[]>(
    wizardVolunteerDefaults,
  );
  const [budgetRows, setBudgetRows] =
    useState<WizardBudgetRow[]>(wizardBudgetDefaults);
  const [campaignRows, setCampaignRows] = useState<WizardCampaignRow[]>(
    wizardCampaignDefaults,
  );
  const [form, setForm] = useState({
    title: "",
    category: "Music",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    venue: "",
    venueAddress: "",
    venueCity: "Nairobi",
    venueCapacity: "",
    venueContact: "",
    venueNotes: "",
    description: "",
  });
  const progress = Math.round(((step + 1) / wizardSteps.length) * 100);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  function nextSaturday() {
    const date = new Date();
    const daysUntilSaturday = (6 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilSaturday);
    return formatDate(date);
  }

  function applyTemplate(kind: "concert" | "festival" | "conference") {
    const templates = {
      concert: {
        title: "Nairobi Live Concert",
        category: "Music",
        venue: "KICC",
        startTime: "18:00",
        endTime: "23:00",
      },
      festival: {
        title: "Koroga Festival 2026",
        category: "Festivals",
        venue: "The Carnivore Grounds",
        startTime: "12:00",
        endTime: "22:00",
      },
      conference: {
        title: "Tech Founders Summit",
        category: "Technology",
        venue: "Sarit Expo Centre",
        startTime: "09:00",
        endTime: "17:00",
      },
    }[kind];
    const date = nextSaturday();
    setForm((current) => ({
      ...current,
      ...templates,
      startDate: date,
      endDate: date,
    }));
  }

  async function saveDraft() {
    const draftTitle = form.title.trim() || "Untitled event";
    const draftVenue = form.venue.trim() || "Venue to be confirmed";
    const draftStartDate = form.startDate || nextSaturday();
    const draftStartTime = form.startTime || "18:00";
    const draftEndDate = form.endDate || draftStartDate;
    const draftEndTime = form.endTime || "";

    const startsAt = new Date(`${draftStartDate}T${draftStartTime}:00+03:00`);
    const endsAt = draftEndTime
      ? new Date(`${draftEndDate}T${draftEndTime}:00+03:00`)
      : null;
    if (
      Number.isNaN(startsAt.getTime()) ||
      (endsAt && Number.isNaN(endsAt.getTime()))
    ) {
      setSaveMessage(
        "Choose a valid event date and time before saving this draft.",
      );
      setStep(0);
      return null;
    }

    setSaving(true);
    setSaveMessage("");
    const response = await fetch("/api/organizer/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: draftId ?? undefined,
        title: draftTitle,
        description: form.description,
        venue: draftVenue,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt?.toISOString() ?? undefined,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setSaveMessage(
        data.error ?? "Unable to save the draft. Please try again.",
      );
      return null;
    }

    setDraftId(data.event.id);
    setForm((current) => ({
      ...current,
      title: current.title || draftTitle,
      venue: current.venue || draftVenue,
      startDate: current.startDate || draftStartDate,
      startTime: current.startTime || draftStartTime,
      endDate: current.endDate || draftEndDate,
    }));
    setSaveMessage(
      data.message ?? "Draft saved securely to your organizer workspace.",
    );
    return data.event.id as string;
  }

  async function saveWizardWorkflow(
    action: OrganizerAction,
    fields: Record<string, string>,
    successMessage: string,
  ) {
    const eventId = draftId ?? (await saveDraft());
    if (!eventId) return false;
    setSaving(true);
    setSaveMessage("");
    const response = await fetch("/api/organizer/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, eventId, fields }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setSaveMessage(
        data.error ?? "Unable to save this step. Please try again.",
      );
      return false;
    }
    setSaveMessage(data.message ?? successMessage);
    return true;
  }

  function ticketFields() {
    return {
      ticketTypes: JSON.stringify(
        ticketRows.filter((row) => Number(row.quantity) > 0),
      ),
      salesStart: ticketSalesStart,
      salesEnd: ticketSalesEnd,
      description: ticketDescription,
    };
  }

  function scheduleFields() {
    const fallbackDate = form.startDate || nextSaturday();
    return {
      scheduleItems: JSON.stringify(
        scheduleRows
          .map((row) => ({
            ...row,
            title: row.title.trim(),
            scheduleDate: row.scheduleDate || fallbackDate,
            locationLabel: row.locationLabel.trim(),
            description: row.description.trim(),
          }))
          .filter((row) => row.title && row.startTime),
      ),
    };
  }

  function foodoFields() {
    return {
      foodoVendors: JSON.stringify(
        foodoRows
          .map((row) => ({
            ...row,
            vendorName: row.vendorName.trim(),
            cuisineType: row.cuisineType.trim(),
            vendorFeeKes: row.vendorFeeKes.trim(),
            stallNumber: row.stallNumber.trim(),
            location: row.location.trim(),
            menuSummary: row.menuSummary.trim(),
            requirements: row.requirements.trim(),
          }))
          .filter((row) => row.vendorName && row.cuisineType),
      ),
    };
  }

  function sponsorFields() {
    return {
      sponsorshipPackages: JSON.stringify(
        sponsorRows.filter(
          (row) => row.name.trim() && Number(row.inventory) > 0,
        ),
      ),
    };
  }

  function staffFields() {
    const rows = staffRows
      .map((row) => ({
        ...row,
        email: row.email.trim().toLowerCase(),
        roleTitle: row.roleTitle.trim(),
      }))
      .filter((row) => row.email);
    return {
      staffInvites: JSON.stringify(rows),
    };
  }

  function volunteerFields() {
    return {
      volunteerOpportunities: JSON.stringify(
        volunteerRows.filter(
          (row) => row.title.trim() && Number(row.requiredCount) > 0,
        ),
      ),
    };
  }

  function budgetFields() {
    return {
      budgets: JSON.stringify(
        budgetRows.filter(
          (row) => row.category.trim() && Number(row.budgetKes) >= 0,
        ),
      ),
    };
  }

  function campaignFields() {
    return {
      campaigns: JSON.stringify(
        campaignRows.filter((row) => row.name.trim() && row.channel.trim()),
      ),
    };
  }

  async function saveCurrentProgress() {
    if (step === 3)
      return saveWizardWorkflow(
        "event_schedule",
        scheduleFields(),
        "Schedule saved.",
      );
    if (step === 4)
      return saveWizardWorkflow(
        "ticket_type",
        ticketFields(),
        "Ticket categories saved.",
      );
    if (step === 5)
      return saveWizardWorkflow("foodo", foodoFields(), "Foodo vendors saved.");
    if (step === 7)
      return saveWizardWorkflow(
        "staff_invite",
        staffFields(),
        "Staff invitations saved.",
      );
    if (step === 8)
      return saveWizardWorkflow(
        "volunteer_opportunity",
        volunteerFields(),
        "Volunteer opportunities saved.",
      );
    if (step === 9)
      return saveWizardWorkflow(
        "sponsorship_package",
        sponsorFields(),
        "Sponsor packages saved.",
      );
    if (step === 10)
      return saveWizardWorkflow(
        "budget",
        budgetFields(),
        "Budget lines saved.",
      );
    if (step === 11)
      return saveWizardWorkflow(
        "campaign",
        campaignFields(),
        "Marketing campaigns saved.",
      );
    const eventId = await saveDraft();
    return Boolean(eventId);
  }

  async function saveAndAdvance() {
    const shouldSaveStep = [3, 4, 5, 7, 8, 9, 10, 11].includes(step);
    if (shouldSaveStep) {
      const saved = await saveCurrentProgress();
      if (!saved) return;
    }
    setStep((current) => Math.min(current + 1, wizardSteps.length - 1));
  }

  function selectPoster(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveMessage("Please choose an image file for the event poster.");
      return;
    }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  }

  function selectGallery(files: FileList | null) {
    const selected = Array.from(files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (selected.length === 0) {
      setSaveMessage("Choose one or more image files for the gallery.");
      return;
    }
    setGalleryFiles(
      selected.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    );
  }

  function safeFileName(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const baseName =
      file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "media";
    return `${baseName}.${extension}`;
  }

  async function uploadFile(
    eventId: string,
    file: File,
    mediaType: "poster" | "image",
    displayOrder: number,
  ) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please login again before uploading media.");

    const path = `${userId}/${eventId}/${Date.now()}-${displayOrder}-${safeFileName(file)}`;
    const { error: uploadError } = await supabase.storage
      .from("event-media")
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
    if (uploadError) throw uploadError;

    if (mediaType === "poster") {
      const { error: deleteError } = await supabase
        .from("event_media")
        .delete()
        .eq("event_id", eventId)
        .eq("media_type", "poster");
      if (deleteError) throw deleteError;
    }

    const { error: mediaError } = await supabase.from("event_media").insert({
      event_id: eventId,
      media_type: mediaType,
      storage_path: path,
      display_order: displayOrder,
    });
    if (mediaError) throw mediaError;
  }

  async function uploadMedia() {
    if (!posterFile && galleryFiles.length === 0) {
      setSaveMessage(
        "Choose a poster or gallery image before uploading media.",
      );
      return;
    }

    setUploading(true);
    setSaveMessage("");
    try {
      const eventId = draftId ?? (await saveDraft());
      if (!eventId) return;
      if (posterFile) await uploadFile(eventId, posterFile, "poster", 0);
      for (const [index, item] of galleryFiles.entries()) {
        await uploadFile(eventId, item.file, "image", index + 1);
      }
      setSaveMessage("Media uploaded successfully to Supabase Storage.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload media. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function openFullSetup(action: OrganizerAction) {
    const eventId = draftId ?? (await saveDraft());
    if (!eventId) return;
    setActiveAction(action);
  }

  return (
    <div className="organizer-workspace">
      <header className="organizer-header">
        <div>
          <p className="section-kicker">Create an event</p>
          <h1>Build your event</h1>
          <p>
            Save progress at every stage, then preview and publish when your
            plan is complete.
          </p>
        </div>
        <button
          className="button secondary"
          type="button"
          onClick={() => void saveCurrentProgress()}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save draft"}
        </button>
      </header>
      {saveMessage && (
        <div className="save-notice">
          <Check size={16} /> {saveMessage}
        </div>
      )}
      <section className="organizer-panel wizard-panel">
        <div className="wizard-progress">
          <div>
            <span>{wizardSteps[step]}</span>
            <b>{progress}% complete</b>
          </div>
          <i>
            <em style={{ width: `${progress}%` }} />
          </i>
        </div>
        <div className="wizard-layout">
          <nav>
            {wizardSteps.map((item, index) => (
              <button
                type="button"
                key={item}
                className={
                  index === step ? "active" : index < step ? "complete" : ""
                }
                onClick={() => setStep(index)}
              >
                {index < step ? <Check size={14} /> : <span>{index + 1}</span>}
                {item}
              </button>
            ))}
          </nav>
          <div className="wizard-content">
            <h2>{wizardSteps[step]}</h2>
            <p>
              {step === 0
                ? "Start with the event title, category, description, and dates."
                : step === 1
                  ? "Add the operational venue information your team needs."
                  : step === wizardSteps.length - 1
                    ? "Review the experience, then publish when every core detail is ready."
                    : `Configure ${wizardSteps[step].toLowerCase()} for the event.`}
            </p>

            {step === 0 && (
              <div className="wizard-form">
                <div className="wide quick-template-row">
                  <button
                    type="button"
                    onClick={() => applyTemplate("concert")}
                  >
                    Concert
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("festival")}
                  >
                    Festival
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate("conference")}
                  >
                    Conference
                  </button>
                </div>
                <label>
                  Event name
                  <input
                    value={form.title}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    placeholder="Nairobi Gospel Night"
                  />
                  <SuggestionChips
                    options={eventNameSuggestions}
                    onPick={(value) => updateField("title", value)}
                  />
                </label>
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      updateField("category", event.target.value)
                    }
                  >
                    {eventCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <PickerField
                  label="Start date"
                  type="date"
                  value={form.startDate}
                  onChange={(value) => updateField("startDate", value)}
                />
                <PickerField
                  label="Start time"
                  type="time"
                  value={form.startTime}
                  onChange={(value) => updateField("startTime", value)}
                />
                <PickerField
                  label="End date"
                  type="date"
                  value={form.endDate}
                  onChange={(value) => updateField("endDate", value)}
                />
                <PickerField
                  label="End time"
                  type="time"
                  value={form.endTime}
                  onChange={(value) => updateField("endTime", value)}
                />
                <label>
                  Venue
                  <input
                    list="event-venue-suggestions"
                    value={form.venue}
                    onChange={(event) =>
                      updateField("venue", event.target.value)
                    }
                    placeholder="KICC, Nairobi"
                  />
                  <datalist id="event-venue-suggestions">
                    {venueSuggestions.map((venue) => (
                      <option key={venue} value={venue} />
                    ))}
                  </datalist>
                  <SuggestionChips
                    options={venueSuggestions.slice(0, 5)}
                    onPick={(value) => updateField("venue", value)}
                  />
                </label>
                <label className="wide">
                  Description
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Tell guests what makes this event worth showing up for."
                  />
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="wizard-form">
                <label>
                  Venue name
                  <input
                    list="venue-name-suggestions"
                    value={form.venue}
                    onChange={(event) =>
                      updateField("venue", event.target.value)
                    }
                    placeholder="KICC"
                  />
                  <datalist id="venue-name-suggestions">
                    {venueSuggestions.map((venue) => (
                      <option key={venue} value={venue} />
                    ))}
                  </datalist>
                  <SuggestionChips
                    options={venueSuggestions.slice(0, 5)}
                    onPick={(value) => updateField("venue", value)}
                  />
                </label>
                <label>
                  City
                  <select
                    value={form.venueCity}
                    onChange={(event) =>
                      updateField("venueCity", event.target.value)
                    }
                  >
                    {cityOptions.map((city) => (
                      <option key={city}>{city}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Capacity
                  <input
                    value={form.venueCapacity}
                    onChange={(event) =>
                      updateField("venueCapacity", event.target.value)
                    }
                    type="number"
                    placeholder="3000"
                  />
                </label>
                <label>
                  Venue contact
                  <input
                    value={form.venueContact}
                    onChange={(event) =>
                      updateField("venueContact", event.target.value)
                    }
                    type="tel"
                    placeholder="2547..."
                  />
                </label>
                <label className="wide">
                  Physical address
                  <textarea
                    value={form.venueAddress}
                    onChange={(event) =>
                      updateField("venueAddress", event.target.value)
                    }
                    placeholder="Main entrance, parking guidance, access notes"
                  />
                </label>
                <label className="wide">
                  Operations notes
                  <textarea
                    value={form.venueNotes}
                    onChange={(event) =>
                      updateField("venueNotes", event.target.value)
                    }
                    placeholder="Loading bay, security access, sound restrictions, emergency exits"
                  />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="wizard-form media-upload-form">
                <label className="wide">
                  Event poster
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => selectPoster(event.target.files?.[0])}
                  />
                </label>
                {posterPreview && (
                  <div
                    className="media-preview wide"
                    style={{ backgroundImage: `url(${posterPreview})` }}
                  >
                    <span>Poster preview</span>
                  </div>
                )}
                <label className="wide">
                  Gallery images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) => selectGallery(event.target.files)}
                  />
                </label>
                {galleryFiles.length > 0 && (
                  <div className="media-gallery-preview wide">
                    {galleryFiles.map((item) => (
                      <div
                        key={item.previewUrl}
                        style={{ backgroundImage: `url(${item.previewUrl})` }}
                      />
                    ))}
                  </div>
                )}
                <div className="wide media-upload-actions">
                  <button
                    className="button"
                    type="button"
                    onClick={() => void uploadMedia()}
                    disabled={uploading || saving}
                  >
                    <Upload size={16} />
                    {uploading ? "Uploading..." : "Upload media"}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <ScheduleStageFields
                rows={scheduleRows}
                setRows={setScheduleRows}
                eventStartDate={form.startDate}
              />
            )}

            {step === 4 && (
              <TicketStageFields
                rows={ticketRows}
                setRows={setTicketRows}
                salesStart={ticketSalesStart}
                setSalesStart={setTicketSalesStart}
                salesEnd={ticketSalesEnd}
                setSalesEnd={setTicketSalesEnd}
                description={ticketDescription}
                setDescription={setTicketDescription}
              />
            )}

            {step === 5 && (
              <FoodoStageFields rows={foodoRows} setRows={setFoodoRows} />
            )}

            {step === 7 && (
              <StaffStageFields rows={staffRows} setRows={setStaffRows} />
            )}

            {step === 8 && (
              <VolunteerStageFields
                rows={volunteerRows}
                setRows={setVolunteerRows}
              />
            )}

            {step === 9 && (
              <SponsorStageFields rows={sponsorRows} setRows={setSponsorRows} />
            )}

            {step === 10 && (
              <BudgetStageFields rows={budgetRows} setRows={setBudgetRows} />
            )}

            {step === 11 && (
              <MarketingStageFields
                rows={campaignRows}
                setRows={setCampaignRows}
              />
            )}

            {step > 2 &&
              ![3, 4, 5, 7, 8, 9, 10, 11].includes(step) &&
              step < wizardSteps.length - 1 && (
                <WizardStageFields step={step} />
              )}

            {step === wizardSteps.length - 1 && (
              <div className="wizard-preview">
                <strong>{form.title || "Untitled event"}</strong>
                <span>
                  {form.venue || "Venue to be confirmed"} -{" "}
                  {form.startDate || "Date to be confirmed"}{" "}
                  {form.startTime || ""}
                </span>
                <p>
                  Review each section, save the draft, then publish when the
                  event is ready.
                </p>
                <Link href="/dashboard/organizer/events" className="button">
                  Preview event
                </Link>
              </div>
            )}

            <div className="wizard-actions">
              <button
                className="button secondary"
                type="button"
                disabled={step === 0}
                onClick={() => setStep((current) => current - 1)}
              >
                Back
              </button>
              <div className="wizard-action-group">
                {wizardWorkflowActions[step] && (
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() =>
                      void openFullSetup(wizardWorkflowActions[step]!)
                    }
                  >
                    Open full setup
                  </button>
                )}
                {step >= 5 && step < wizardSteps.length - 1 && (
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => setStep(wizardSteps.length - 1)}
                  >
                    Skip add-ons
                  </button>
                )}
                <button
                  className="button"
                  type="button"
                  onClick={() => void saveAndAdvance()}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : step === wizardSteps.length - 1
                      ? "Publish when ready"
                      : step === 3
                        ? "Save schedule"
                        : step === 4
                          ? "Save tickets"
                          : step === 5
                            ? "Save Foodo"
                            : step === 7
                              ? "Save staff"
                              : step === 8
                                ? "Save volunteers"
                                : step === 9
                                  ? "Save sponsors"
                                  : step === 10
                                    ? "Save budget"
                                    : step === 11
                                      ? "Save marketing"
                                      : "Continue"}{" "}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {activeAction && (
        <OrganizerActionForm
          action={activeAction}
          initialEventId={draftId ?? undefined}
          onClose={() => setActiveAction(null)}
        />
      )}
    </div>
  );
}

function WizardStageFields({ step }: { step: number }) {
  const config = wizardSuggestions[step];
  if (!config) return null;

  return (
    <div className="wizard-form">
      <div className="wide suggested-options-panel">
        <strong>Recommended picks</strong>
        <span>{config.guidance}</span>
      </div>
      {step === 11 && <MarketingChannelGuide />}
      {config.fields.map((field) => (
        <SuggestedField key={field.name} field={field} />
      ))}
    </div>
  );
}

function MarketingChannelGuide() {
  return (
    <div className="wide marketing-channel-guide">
      <strong>How Tokea uses the channels</strong>
      <div>
        {marketingChannelUses.map(([channel, use]) => (
          <article key={channel}>
            <b>{channel}</b>
            <span>{use}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function SuggestedField({ field }: { field: WizardField }) {
  const [value, setValue] = useState(field.defaultValue ?? "");
  if (
    field.type === "date" ||
    field.type === "time" ||
    field.type === "datetime-local"
  ) {
    return (
      <PickerField
        label={field.label}
        type={field.type}
        value={value}
        onChange={setValue}
      />
    );
  }

  if (field.type === "select") {
    return (
      <label className={field.full ? "wide" : undefined}>
        {field.label}
        <select
          value={value}
          onChange={(event) => setValue(event.target.value)}
        >
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {field.options && (
          <SuggestionChips options={field.options} onPick={setValue} />
        )}
      </label>
    );
  }

  return (
    <label className={field.full ? "wide" : undefined}>
      {field.label}
      <input
        type={field.type}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={field.placeholder}
      />
    </label>
  );
}

function SuggestionChips({
  options,
  onPick,
}: {
  options: string[];
  onPick: (value: string) => void;
}) {
  return (
    <div className="suggestion-chips">
      {options.map((option) => (
        <button type="button" key={option} onClick={() => onPick(option)}>
          {option}
        </button>
      ))}
    </div>
  );
}

function PickerField({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: "date" | "time" | "datetime-local";
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const kind = type === "time" ? "time" : "date";

  function openPicker() {
    inputRef.current?.showPicker?.();
    inputRef.current?.focus();
  }

  return (
    <label>
      {label}
      <div className="picker-control">
        <input
          ref={inputRef}
          className="picker-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={type}
        />
        <button type="button" onClick={openPicker}>
          Pick {kind}
        </button>
      </div>
    </label>
  );
}

function ScheduleStageFields({
  rows,
  setRows,
  eventStartDate,
}: {
  rows: WizardScheduleRow[];
  setRows: (rows: WizardScheduleRow[]) => void;
  eventStartDate: string;
}) {
  function updateRow(
    index: number,
    key: keyof WizardScheduleRow,
    value: string,
  ) {
    setRows(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  }

  function addRow() {
    setRows([
      ...rows,
      {
        title: "After party",
        scheduleDate: eventStartDate,
        startTime: "",
        endTime: "",
        locationLabel: "After party venue",
        description: "Late-night continuation after the main event.",
      },
    ]);
  }

  function removeRow(index: number) {
    if (rows.length > 1)
      setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="wizard-form ticket-bulk-grid">
      <div className="wide ticket-bulk-head">
        <strong>Schedule tray</strong>
      </div>
      {rows.map((row, index) => (
        <div
          className="ticket-bulk-card multi-record-card"
          key={`schedule-${index}`}
        >
          <div className="multi-record-head">
            <strong>Schedule item {index + 1}</strong>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length === 1}
            >
              Remove
            </button>
          </div>
          <label>
            Title
            <select
              value={row.title}
              onChange={(event) =>
                updateRow(index, "title", event.target.value)
              }
            >
              {scheduleTitleSuggestions.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
            <SuggestionChips
              options={scheduleTitleSuggestions.slice(0, 5)}
              onPick={(value) => updateRow(index, "title", value)}
            />
          </label>
          <PickerField
            label="Date"
            type="date"
            value={row.scheduleDate || eventStartDate}
            onChange={(value) => updateRow(index, "scheduleDate", value)}
          />
          <PickerField
            label="Start time"
            type="time"
            value={row.startTime}
            onChange={(value) => updateRow(index, "startTime", value)}
          />
          <PickerField
            label="End time"
            type="time"
            value={row.endTime}
            onChange={(value) => updateRow(index, "endTime", value)}
          />
          <label className="wide">
            Location
            <input
              value={row.locationLabel}
              onChange={(event) =>
                updateRow(index, "locationLabel", event.target.value)
              }
              placeholder="Main stage, VIP entrance, Gate B"
            />
          </label>
          <label className="wide">
            Details
            <textarea
              value={row.description}
              onChange={(event) =>
                updateRow(index, "description", event.target.value)
              }
              placeholder="What happens during this part of the event."
            />
          </label>
        </div>
      ))}
      <button className="button secondary wide" type="button" onClick={addRow}>
        Add another schedule item
      </button>
    </div>
  );
}

function TicketStageFields({
  rows,
  setRows,
  salesStart,
  setSalesStart,
  salesEnd,
  setSalesEnd,
  description,
  setDescription,
}: {
  rows: WizardTicketRow[];
  setRows: (rows: WizardTicketRow[]) => void;
  salesStart: string;
  setSalesStart: (value: string) => void;
  salesEnd: string;
  setSalesEnd: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}) {
  function updateRow(index: number, key: keyof WizardTicketRow, value: string) {
    setRows(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  }

  function addRow() {
    setRows([...rows, { name: "Regular", priceKes: "0", quantity: "100" }]);
  }

  function removeRow(index: number) {
    if (rows.length > 1)
      setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="wizard-form ticket-bulk-grid">
      <div className="wide ticket-bulk-head">
        <strong>Ticket tray</strong>
        <span>
          Add every ticket category for this event, remove what you do not need,
          then click Save tickets before continuing.
        </span>
      </div>
      {rows.map((row, index) => (
        <div
          className="ticket-bulk-card multi-record-card"
          key={`ticket-${index}`}
        >
          <div className="multi-record-head">
            <strong>Ticket {index + 1}</strong>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length === 1}
            >
              Remove
            </button>
          </div>
          <label>
            Type
            <select
              value={row.name}
              onChange={(event) => updateRow(index, "name", event.target.value)}
            >
              {standardTicketTypes.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Price (KES)
            <input
              type="number"
              value={row.priceKes}
              onChange={(event) =>
                updateRow(index, "priceKes", event.target.value)
              }
            />
          </label>
          <label>
            Quantity
            <input
              type="number"
              value={row.quantity}
              onChange={(event) =>
                updateRow(index, "quantity", event.target.value)
              }
            />
          </label>
        </div>
      ))}
      <button className="button secondary wide" type="button" onClick={addRow}>
        Add another ticket type
      </button>
      <PickerField
        label="Sales start"
        type="datetime-local"
        value={salesStart}
        onChange={setSalesStart}
      />
      <PickerField
        label="Sales end"
        type="datetime-local"
        value={salesEnd}
        onChange={setSalesEnd}
      />
      <label className="wide">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe who this ticket is for, benefits, group size, gate restrictions, or access level."
        />
      </label>
    </div>
  );
}

function FoodoStageFields({
  rows,
  setRows,
}: {
  rows: WizardFoodoRow[];
  setRows: (rows: WizardFoodoRow[]) => void;
}) {
  function updateRow(index: number, key: keyof WizardFoodoRow, value: string) {
    setRows(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  }

  function addRow() {
    setRows([
      ...rows,
      {
        vendorName: "",
        cuisineType: "Coffee and dessert",
        vendorFeeKes: "12000",
        stallNumber: `F${rows.length + 1}`,
        location: "Food court",
        menuSummary: "",
        requirements: "",
      },
    ]);
  }

  function removeRow(index: number) {
    if (rows.length > 1)
      setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="wizard-form ticket-bulk-grid">
      <div className="wide ticket-bulk-head">
        <strong>Foodo vendor tray</strong>
      </div>
      {rows.map((row, index) => (
        <div
          className="ticket-bulk-card multi-record-card"
          key={`foodo-${index}`}
        >
          <div className="multi-record-head">
            <strong>Vendor {index + 1}</strong>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length === 1}
            >
              Remove
            </button>
          </div>
          <label>
            Vendor name
            <input
              value={row.vendorName}
              onChange={(event) =>
                updateRow(index, "vendorName", event.target.value)
              }
              placeholder="Vendor business name"
            />
          </label>
          <label>
            Food category
            <select
              value={row.cuisineType}
              onChange={(event) =>
                updateRow(index, "cuisineType", event.target.value)
              }
            >
              {foodoCuisineSuggestions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <SuggestionChips
              options={foodoCuisineSuggestions.slice(0, 5)}
              onPick={(value) => updateRow(index, "cuisineType", value)}
            />
          </label>
          <label>
            Vendor fee (KES)
            <input
              type="number"
              value={row.vendorFeeKes}
              onChange={(event) =>
                updateRow(index, "vendorFeeKes", event.target.value)
              }
            />
          </label>
          <label>
            Stall
            <input
              value={row.stallNumber}
              onChange={(event) =>
                updateRow(index, "stallNumber", event.target.value)
              }
              placeholder="F1"
            />
          </label>
          <label className="wide">
            Location
            <input
              value={row.location}
              onChange={(event) =>
                updateRow(index, "location", event.target.value)
              }
              placeholder="Food court, VIP lounge, grill zone"
            />
          </label>
          <label className="wide">
            Menu summary
            <textarea
              value={row.menuSummary}
              onChange={(event) =>
                updateRow(index, "menuSummary", event.target.value)
              }
              placeholder="Main items, drinks, combos, specials, and expected menu range."
            />
          </label>
          <label className="wide">
            Requirements
            <textarea
              value={row.requirements}
              onChange={(event) =>
                updateRow(index, "requirements", event.target.value)
              }
              placeholder="Power, water, tent, fire safety, compliance, passes, waste handling."
            />
          </label>
        </div>
      ))}
      <button className="button secondary wide" type="button" onClick={addRow}>
        Add another Foodo vendor
      </button>
    </div>
  );
}

function StaffStageFields({
  rows,
  setRows,
}: {
  rows: WizardStaffRow[];
  setRows: (rows: WizardStaffRow[]) => void;
}) {
  function updateRow(index: number, key: keyof WizardStaffRow, value: string) {
    setRows(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  }

  function addRow() {
    setRows([
      ...rows,
      {
        email: "",
        roleTitle: "Usher",
        department: "ushers",
        shiftStart: "",
        shiftEnd: "",
      },
    ]);
  }

  function removeRow(index: number) {
    if (rows.length > 1)
      setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="wizard-form ticket-bulk-grid">
      <div className="wide ticket-bulk-head">
        <strong>Staff invitation tray</strong>
        <span>
          Add each staff member, choose their event role and shift, then click
          Save staff before continuing. Staff with existing Tokea accounts are
          assigned immediately; new staff remain as pending invitations.
        </span>
      </div>
      {rows.map((row, index) => (
        <div
          className="ticket-bulk-card multi-record-card"
          key={`staff-${index}`}
        >
          <div className="multi-record-head">
            <strong>Staff {index + 1}</strong>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length === 1}
            >
              Remove
            </button>
          </div>
          <label className="wide">
            Staff email
            <input
              type="email"
              value={row.email}
              onChange={(event) =>
                updateRow(index, "email", event.target.value)
              }
              placeholder="staff@tokeaevents.co.ke"
            />
          </label>
          <label>
            Role title
            <select
              value={row.roleTitle}
              onChange={(event) =>
                updateRow(index, "roleTitle", event.target.value)
              }
            >
              {staffRoleSuggestions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <SuggestionChips
              options={staffRoleSuggestions.slice(0, 5)}
              onPick={(value) => updateRow(index, "roleTitle", value)}
            />
          </label>
          <label>
            Department
            <select
              value={row.department}
              onChange={(event) =>
                updateRow(index, "department", event.target.value)
              }
            >
              {staffDepartmentOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <PickerField
            label="Shift start"
            type="datetime-local"
            value={row.shiftStart}
            onChange={(value) => updateRow(index, "shiftStart", value)}
          />
          <PickerField
            label="Shift end"
            type="datetime-local"
            value={row.shiftEnd}
            onChange={(value) => updateRow(index, "shiftEnd", value)}
          />
        </div>
      ))}
      <button className="button secondary wide" type="button" onClick={addRow}>
        Add another staff member
      </button>
    </div>
  );
}

function VolunteerStageFields({
  rows,
  setRows,
}: {
  rows: WizardVolunteerRow[];
  setRows: (rows: WizardVolunteerRow[]) => void;
}) {
  function updateRow(
    index: number,
    key: keyof WizardVolunteerRow,
    value: string,
  ) {
    setRows(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  }

  function addRow() {
    setRows([
      ...rows,
      {
        title: "Queue marshals",
        requiredCount: "6",
        volunteerEmail: "",
        shiftStart: "",
        shiftEnd: "",
        description:
          "Help guests move smoothly through queues and support points.",
      },
    ]);
  }

  function removeRow(index: number) {
    if (rows.length > 1)
      setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="wizard-form ticket-bulk-grid">
      <div className="wide ticket-bulk-head">
        <strong>Volunteer opportunity tray</strong>
        <span>
          Add every volunteer team you need, set capacity and shifts, optionally
          assign a volunteer by email, then click Save volunteers before
          continuing.
        </span>
      </div>
      {rows.map((row, index) => (
        <div
          className="ticket-bulk-card multi-record-card"
          key={`volunteer-${index}`}
        >
          <div className="multi-record-head">
            <strong>Opportunity {index + 1}</strong>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length === 1}
            >
              Remove
            </button>
          </div>
          <label>
            Volunteer role
            <select
              value={row.title}
              onChange={(event) =>
                updateRow(index, "title", event.target.value)
              }
            >
              {volunteerRoleSuggestions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <SuggestionChips
              options={volunteerRoleSuggestions.slice(0, 5)}
              onPick={(value) => updateRow(index, "title", value)}
            />
          </label>
          <label>
            Volunteers required
            <input
              type="number"
              value={row.requiredCount}
              onChange={(event) =>
                updateRow(index, "requiredCount", event.target.value)
              }
            />
          </label>
          <label className="wide">
            Assign volunteer email optional
            <input
              type="email"
              value={row.volunteerEmail}
              onChange={(event) =>
                updateRow(index, "volunteerEmail", event.target.value)
              }
              placeholder="volunteer@tokeaevents.co.ke"
            />
          </label>
          <PickerField
            label="Shift start"
            type="datetime-local"
            value={row.shiftStart}
            onChange={(value) => updateRow(index, "shiftStart", value)}
          />
          <PickerField
            label="Shift end"
            type="datetime-local"
            value={row.shiftEnd}
            onChange={(value) => updateRow(index, "shiftEnd", value)}
          />
          <label className="wide">
            Details
            <textarea
              value={row.description}
              onChange={(event) =>
                updateRow(index, "description", event.target.value)
              }
              placeholder="What this team will do, reporting point, supervisor, and expectations."
            />
          </label>
        </div>
      ))}
      <button className="button secondary wide" type="button" onClick={addRow}>
        Add another volunteer opportunity
      </button>
    </div>
  );
}

function SponsorStageFields({
  rows,
  setRows,
}: {
  rows: WizardSponsorRow[];
  setRows: (rows: WizardSponsorRow[]) => void;
}) {
  function updateRow(
    index: number,
    key: keyof WizardSponsorRow,
    value: string,
  ) {
    setRows(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  }

  function addRow() {
    setRows([
      ...rows,
      {
        name: "Bronze Partner",
        priceKes: "75000",
        inventory: "1",
        benefits:
          "Logo on event page\nSocial media mention\nGeneral admission tickets",
      },
    ]);
  }

  function removeRow(index: number) {
    if (rows.length > 1)
      setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="wizard-form ticket-bulk-grid">
      <div className="wide ticket-bulk-head">
        <strong>Sponsor package tray</strong>
        <span>
          Add every sponsor package you want to sell, define package value and
          benefits, then click Save sponsors before continuing.
        </span>
      </div>
      {rows.map((row, index) => (
        <div
          className="ticket-bulk-card multi-record-card"
          key={`sponsor-${index}`}
        >
          <div className="multi-record-head">
            <strong>Package {index + 1}</strong>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length === 1}
            >
              Remove
            </button>
          </div>
          <label>
            Package
            <select
              value={row.name}
              onChange={(event) => updateRow(index, "name", event.target.value)}
            >
              {sponsorshipPackages.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <SuggestionChips
              options={sponsorshipPackages.slice(0, 5)}
              onPick={(value) => updateRow(index, "name", value)}
            />
          </label>
          <label>
            Package value (KES)
            <input
              type="number"
              value={row.priceKes}
              onChange={(event) =>
                updateRow(index, "priceKes", event.target.value)
              }
            />
          </label>
          <label>
            Available packages
            <input
              type="number"
              value={row.inventory}
              onChange={(event) =>
                updateRow(index, "inventory", event.target.value)
              }
            />
          </label>
          <label className="wide">
            Benefits
            <textarea
              value={row.benefits}
              onChange={(event) =>
                updateRow(index, "benefits", event.target.value)
              }
              placeholder="One benefit per line: logo placement, booth, mentions, VIP tickets..."
            />
          </label>
        </div>
      ))}
      <button className="button secondary wide" type="button" onClick={addRow}>
        Add another sponsor package
      </button>
    </div>
  );
}

function BudgetStageFields({
  rows,
  setRows,
}: {
  rows: WizardBudgetRow[];
  setRows: (rows: WizardBudgetRow[]) => void;
}) {
  function updateRow(index: number, key: keyof WizardBudgetRow, value: string) {
    setRows(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  }

  function addRow() {
    setRows([
      ...rows,
      {
        category: "Contingency",
        budgetKes: "25000",
        notes: "Buffer for urgent event-day expenses.",
      },
    ]);
  }

  function removeRow(index: number) {
    if (rows.length > 1)
      setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="wizard-form ticket-bulk-grid">
      <div className="wide ticket-bulk-head">
        <strong>Budget line tray</strong>
        <span>
          Add all cost categories, estimate the amount, note what each line
          covers, then click Save budget before continuing.
        </span>
      </div>
      {rows.map((row, index) => (
        <div
          className="ticket-bulk-card multi-record-card"
          key={`budget-${index}`}
        >
          <div className="multi-record-head">
            <strong>Budget line {index + 1}</strong>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length === 1}
            >
              Remove
            </button>
          </div>
          <label>
            Category
            <select
              value={row.category}
              onChange={(event) =>
                updateRow(index, "category", event.target.value)
              }
            >
              {budgetCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <SuggestionChips
              options={budgetCategories.slice(0, 6)}
              onPick={(value) => updateRow(index, "category", value)}
            />
          </label>
          <label>
            Budget (KES)
            <input
              type="number"
              value={row.budgetKes}
              onChange={(event) =>
                updateRow(index, "budgetKes", event.target.value)
              }
            />
          </label>
          <label className="wide">
            Notes
            <textarea
              value={row.notes}
              onChange={(event) =>
                updateRow(index, "notes", event.target.value)
              }
              placeholder="What this budget line covers, supplier assumptions, payment terms, or risks."
            />
          </label>
        </div>
      ))}
      <button className="button secondary wide" type="button" onClick={addRow}>
        Add another budget line
      </button>
    </div>
  );
}

function MarketingStageFields({
  rows,
  setRows,
}: {
  rows: WizardCampaignRow[];
  setRows: (rows: WizardCampaignRow[]) => void;
}) {
  function updateRow(
    index: number,
    key: keyof WizardCampaignRow,
    value: string,
  ) {
    setRows(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    );
  }

  function addRow() {
    setRows([
      ...rows,
      {
        name: "Last-call reminder",
        channel: "WhatsApp",
        objective: "Last-call urgency",
        contentFormat: "Broadcast copy + short link",
        cta: "Buy ticket",
        trackingCode: "WA-LASTCALL",
        startsAt: "",
        endsAt: "",
        message:
          "Final reminder with date, venue, price, urgency, and ticket link.",
      },
    ]);
  }

  function removeRow(index: number) {
    if (rows.length > 1)
      setRows(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className="wizard-form ticket-bulk-grid">
      <div className="wide ticket-bulk-head">
        <strong>Marketing campaign tray</strong>
        <span>
          Plan each campaign push separately so Tokea can track channel,
          objective, CTA, timing, and performance.
        </span>
      </div>
      <MarketingChannelGuide />
      {rows.map((row, index) => (
        <div
          className="ticket-bulk-card multi-record-card"
          key={`campaign-${index}`}
        >
          <div className="multi-record-head">
            <strong>Campaign {index + 1}</strong>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length === 1}
            >
              Remove
            </button>
          </div>
          <label>
            Campaign name
            <select
              value={row.name}
              onChange={(event) => updateRow(index, "name", event.target.value)}
            >
              {campaignNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <SuggestionChips
              options={campaignNames.slice(0, 5)}
              onPick={(value) => updateRow(index, "name", value)}
            />
          </label>
          <label>
            Channel
            <select
              value={row.channel}
              onChange={(event) =>
                updateRow(index, "channel", event.target.value)
              }
            >
              {campaignChannels.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
            <SuggestionChips
              options={campaignChannels.slice(0, 5)}
              onPick={(value) => updateRow(index, "channel", value)}
            />
          </label>
          <label>
            Objective
            <select
              value={row.objective}
              onChange={(event) =>
                updateRow(index, "objective", event.target.value)
              }
            >
              {campaignObjectives.map((objective) => (
                <option key={objective} value={objective}>
                  {objective}
                </option>
              ))}
            </select>
          </label>
          <label>
            Content format
            <select
              value={row.contentFormat}
              onChange={(event) =>
                updateRow(index, "contentFormat", event.target.value)
              }
            >
              {campaignFormats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </label>
          <label>
            Call to action
            <select
              value={row.cta}
              onChange={(event) => updateRow(index, "cta", event.target.value)}
            >
              {campaignCtas.map((cta) => (
                <option key={cta} value={cta}>
                  {cta}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tracking code
            <input
              value={row.trackingCode}
              onChange={(event) =>
                updateRow(index, "trackingCode", event.target.value)
              }
              placeholder="IG-LAUNCH"
            />
          </label>
          <PickerField
            label="Campaign start"
            type="datetime-local"
            value={row.startsAt}
            onChange={(value) => updateRow(index, "startsAt", value)}
          />
          <PickerField
            label="Campaign end"
            type="datetime-local"
            value={row.endsAt}
            onChange={(value) => updateRow(index, "endsAt", value)}
          />
          <label className="wide">
            Campaign message
            <textarea
              value={row.message}
              onChange={(event) =>
                updateRow(index, "message", event.target.value)
              }
              placeholder="Write the campaign brief, post copy, broadcast copy, creator instructions, or radio mention notes."
            />
          </label>
        </div>
      ))}
      <button className="button secondary wide" type="button" onClick={addRow}>
        Add another campaign
      </button>
    </div>
  );
}
