export type UserRole = "student" | "faculty" | "admin" | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  studentId?: string;
  avatar?: string;
}

export const demoUsers: User[] = [
  {
    id: "1",
    name: "Ankit Sharma",
    email: "student@campus.edu",
    role: "student",
    department: "Computer Science",
    studentId: "CS2024001",
  },
  {
    id: "2",
    name: "Dr. Priya Mehta",
    email: "faculty@campus.edu",
    role: "faculty",
    department: "Computer Science",
  },
  {
    id: "3",
    name: "Rajesh Kumar",
    email: "admin@campus.edu",
    role: "admin",
    department: "Administration",
  },
  {
    id: "4",
    name: "Neha Gupta",
    email: "superadmin@campus.edu",
    role: "superadmin",
  },
];

export type ComplaintStatus = "pending" | "in_progress" | "resolved";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  classroom: string;
  issueType: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedTo?: string;
  department: string;
  timeline: { date: string; status: string; note: string }[];
}

export const mockComplaints: Complaint[] = [
  {
    id: "C001",
    title: "Projector not working",
    description:
      "The projector in Room 301 has been malfunctioning since last week. Display shows flickering.",
    classroom: "Room 301",
    issueType: "Equipment",
    status: "pending",
    createdAt: "2026-02-10",
    updatedAt: "2026-02-10",
    createdBy: "1",
    department: "Computer Science",
    timeline: [
      {
        date: "2026-02-10",
        status: "Created",
        note: "Complaint raised by student",
      },
    ],
  },
  {
    id: "C002",
    title: "AC not cooling",
    description:
      "The air conditioner in Lab 102 is running but not cooling. Temperature is unbearable.",
    classroom: "Lab 102",
    issueType: "Infrastructure",
    status: "in_progress",
    createdAt: "2026-02-08",
    updatedAt: "2026-02-11",
    createdBy: "1",
    assignedTo: "2",
    department: "Computer Science",
    timeline: [
      { date: "2026-02-08", status: "Created", note: "Complaint raised" },
      {
        date: "2026-02-09",
        status: "Assigned",
        note: "Assigned to Dr. Priya Mehta",
      },
      {
        date: "2026-02-11",
        status: "In Progress",
        note: "Technician dispatched",
      },
    ],
  },
  {
    id: "C003",
    title: "Broken chair in row 3",
    description: "Two chairs in row 3 of Lecture Hall A are broken and unsafe.",
    classroom: "Lecture Hall A",
    issueType: "Furniture",
    status: "resolved",
    createdAt: "2026-02-01",
    updatedAt: "2026-02-05",
    createdBy: "1",
    assignedTo: "2",
    department: "Computer Science",
    timeline: [
      { date: "2026-02-01", status: "Created", note: "Complaint raised" },
      {
        date: "2026-02-02",
        status: "Assigned",
        note: "Assigned to maintenance",
      },
      { date: "2026-02-05", status: "Resolved", note: "Chairs replaced" },
    ],
  },
  {
    id: "C004",
    title: "Lights flickering",
    description: "Tube lights in corridor B2 are flickering constantly.",
    classroom: "Corridor B2",
    issueType: "Electrical",
    status: "pending",
    createdAt: "2026-02-12",
    updatedAt: "2026-02-12",
    createdBy: "1",
    department: "Electrical Engineering",
    timeline: [
      { date: "2026-02-12", status: "Created", note: "Complaint raised" },
    ],
  },
  {
    id: "C005",
    title: "Water leakage in ceiling",
    description:
      "Water is leaking from the ceiling near the entrance of Room 205.",
    classroom: "Room 205",
    issueType: "Infrastructure",
    status: "in_progress",
    createdAt: "2026-02-06",
    updatedAt: "2026-02-10",
    createdBy: "1",
    assignedTo: "2",
    department: "Mechanical Engineering",
    timeline: [
      { date: "2026-02-06", status: "Created", note: "Complaint raised" },
      {
        date: "2026-02-08",
        status: "Assigned",
        note: "Assigned to facilities",
      },
      {
        date: "2026-02-10",
        status: "In Progress",
        note: "Inspection scheduled",
      },
    ],
  },
];

export interface Doubt {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
  upvotes: number;
  answersCount: number;
  isResolved: boolean;
}

export interface Answer {
  id: string;
  doubtId: string;
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  isAccepted: boolean;
  isVerified: boolean;
  upvotes: number;
}

export const mockDoubts: Doubt[] = [
  {
    id: "D001",
    title: "How to implement binary search in Python?",
    description:
      "I understand the concept but I'm confused about the iterative vs recursive approach. Can someone explain with examples?",
    tags: ["Python", "Algorithms", "DSA"],
    createdBy: "1",
    createdByName: "Ankit Sharma",
    createdAt: "2026-02-11",
    upvotes: 12,
    answersCount: 3,
    isResolved: true,
  },
  {
    id: "D002",
    title: "Difference between TCP and UDP?",
    description:
      "Can someone explain the key differences and when to use each protocol?",
    tags: ["Networking", "CN"],
    createdBy: "1",
    createdByName: "Ankit Sharma",
    createdAt: "2026-02-12",
    upvotes: 8,
    answersCount: 2,
    isResolved: false,
  },
  {
    id: "D003",
    title: "What is the time complexity of merge sort?",
    description:
      "I need a detailed explanation of why merge sort is O(n log n) in all cases.",
    tags: ["DSA", "Sorting"],
    createdBy: "1",
    createdByName: "Ankit Sharma",
    createdAt: "2026-02-10",
    upvotes: 15,
    answersCount: 4,
    isResolved: true,
  },
  {
    id: "D004",
    title: "How does React virtual DOM work?",
    description:
      "I've read about it but I'm confused about the diffing algorithm.",
    tags: ["React", "Web Dev"],
    createdBy: "1",
    createdByName: "Ankit Sharma",
    createdAt: "2026-02-09",
    upvotes: 20,
    answersCount: 5,
    isResolved: false,
  },
  {
    id: "D005",
    title: "Explain normalization in DBMS",
    description:
      "What are the different normal forms (1NF, 2NF, 3NF, BCNF) with examples?",
    tags: ["DBMS", "Database"],
    createdBy: "1",
    createdByName: "Ankit Sharma",
    createdAt: "2026-02-08",
    upvotes: 6,
    answersCount: 1,
    isResolved: false,
  },
];

export const mockAnswers: Answer[] = [
  {
    id: "A001",
    doubtId: "D001",
    content:
      "Binary search works by dividing the search interval in half. The iterative approach uses a while loop, while recursive calls itself. Iterative is generally preferred for better space complexity O(1) vs O(log n).",
    createdBy: "2",
    createdByName: "Dr. Priya Mehta",
    createdAt: "2026-02-11",
    isAccepted: true,
    isVerified: true,
    upvotes: 8,
  },
  {
    id: "A002",
    doubtId: "D001",
    content:
      "Here's a simple iterative example:\n\ndef binary_search(arr, target):\n    left, right = 0, len(arr)-1\n    while left <= right:\n        mid = (left+right)//2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: left = mid+1\n        else: right = mid-1\n    return -1",
    createdBy: "1",
    createdByName: "Ankit Sharma",
    createdAt: "2026-02-11",
    isAccepted: false,
    isVerified: false,
    upvotes: 3,
  },
  {
    id: "A003",
    doubtId: "D002",
    content:
      "TCP is connection-oriented and reliable (guarantees delivery). UDP is connectionless and faster but unreliable. Use TCP for web/email, UDP for streaming/gaming.",
    createdBy: "2",
    createdByName: "Dr. Priya Mehta",
    createdAt: "2026-02-12",
    isAccepted: false,
    isVerified: true,
    upvotes: 5,
  },
  {
    id: "A004",
    doubtId: "D004",
    content:
      "React Virtual DOM is a lightweight copy of the real DOM. When state changes, React creates a new virtual DOM, diffs it with the old one (reconciliation), and applies minimal changes to the real DOM. This makes updates efficient.",
    createdBy: "2",
    createdByName: "Dr. Priya Mehta",
    createdAt: "2026-02-10",
    isAccepted: false,
    isVerified: true,
    upvotes: 12,
  },
];

export const departments = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electronics",
  "Information Technology",
];

export const issueTypes = [
  "Equipment",
  "Infrastructure",
  "Furniture",
  "Electrical",
  "Plumbing",
  "Cleanliness",
  "Other",
];

export const notifications = [
  {
    id: "1",
    message: "Your complaint C001 has been reviewed",
    time: "5 min ago",
    read: false,
  },
  {
    id: "2",
    message: "New answer on your doubt about binary search",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    message: "Complaint C003 has been resolved",
    time: "2 hours ago",
    read: true,
  },
  {
    id: "4",
    message: "Dr. Priya verified an answer on your doubt",
    time: "1 day ago",
    read: true,
  },
];

export const analyticsData = {
  complaintsByMonth: [
    { month: "Sep", complaints: 12, resolved: 10 },
    { month: "Oct", complaints: 19, resolved: 15 },
    { month: "Nov", complaints: 15, resolved: 13 },
    { month: "Dec", complaints: 22, resolved: 18 },
    { month: "Jan", complaints: 28, resolved: 20 },
    { month: "Feb", complaints: 16, resolved: 8 },
  ],
  complaintsByType: [
    { name: "Equipment", value: 35 },
    { name: "Infrastructure", value: 25 },
    { name: "Furniture", value: 15 },
    { name: "Electrical", value: 12 },
    { name: "Plumbing", value: 8 },
    { name: "Other", value: 5 },
  ],
  complaintsByDept: [
    { dept: "CS", count: 30 },
    { dept: "EE", count: 22 },
    { dept: "ME", count: 18 },
    { dept: "CE", count: 15 },
    { dept: "EC", count: 12 },
    { dept: "IT", count: 10 },
  ],
  resolutionTime: [
    { month: "Sep", avgDays: 3.2 },
    { month: "Oct", avgDays: 2.8 },
    { month: "Nov", avgDays: 4.1 },
    { month: "Dec", avgDays: 3.5 },
    { month: "Jan", avgDays: 2.5 },
    { month: "Feb", avgDays: 3.0 },
  ],
};
