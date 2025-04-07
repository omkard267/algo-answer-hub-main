
import { Difficulty, Question, User } from "./types";

export const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    isAdmin: true,
    avatarUrl: "https://ui-avatars.com/api/?name=Admin&background=random"
  },
  {
    id: "2",
    username: "user",
    email: "user@example.com",
    isAdmin: false,
    avatarUrl: "https://ui-avatars.com/api/?name=User&background=random"
  }
];

export const mockQuestions: Question[] = [
  {
    id: "1",
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    difficulty: Difficulty.EASY,
    tags: ["Array", "Hash Table"],
    createdAt: new Date(2023, 3, 15),
    solutions: [
      {
        id: "101",
        title: "O(n) Solution using Hash Map",
        content: "We can use a hash map to store the values we've seen so far. For each number, we check if target - nums[i] is in the hash map. If it is, we return the indices. Otherwise, we add the current number to the hash map.",
        code: `function twoSum(nums: number[], target: number): number[] {
  const map: Record<number, number> = {};
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map[complement] !== undefined) {
      return [map[complement], i];
    }
    map[nums[i]] = i;
  }
  
  return [];
}`,
        createdAt: new Date(2023, 3, 15),
        likes: 15,
        comments: [
          {
            id: "comment1",
            content: "This solution is very efficient!",
            createdAt: new Date(2023, 3, 16),
            user: mockUsers[1]
          }
        ],
        likedByCurrentUser: false
      }
    ]
  },
  {
    id: "2",
    title: "Merge Two Sorted Lists",
    description: "Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.",
    difficulty: Difficulty.EASY,
    tags: ["Linked List", "Recursion"],
    createdAt: new Date(2023, 4, 20),
    solutions: [
      {
        id: "201",
        title: "Iterative Solution",
        content: "We create a dummy head node to which we attach the smaller of the two list's current nodes, then advance the pointer for that list.",
        code: `function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(-1);
  let prev = dummy;
  
  while (l1 !== null && l2 !== null) {
    if (l1.val <= l2.val) {
      prev.next = l1;
      l1 = l1.next;
    } else {
      prev.next = l2;
      l2 = l2.next;
    }
    prev = prev.next;
  }
  
  // Attach the remaining elements
  prev.next = l1 === null ? l2 : l1;
  
  return dummy.next;
}`,
        createdAt: new Date(2023, 4, 22),
        likes: 8,
        comments: [],
        likedByCurrentUser: true
      }
    ]
  },
  {
    id: "3",
    title: "Merge Intervals",
    description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    difficulty: Difficulty.MEDIUM,
    tags: ["Array", "Sorting"],
    createdAt: new Date(2023, 5, 10),
    solutions: [
      {
        id: "301",
        title: "Sort and Merge",
        content: "First, we sort the intervals by their start time. Then we iterate through the sorted intervals and merge overlapping ones.",
        code: `function merge(intervals: number[][]): number[][] {
  if (intervals.length <= 1) return intervals;
  
  // Sort intervals by start time
  intervals.sort((a, b) => a[0] - b[0]);
  
  const result: number[][] = [intervals[0]];
  
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const lastMerged = result[result.length - 1];
    
    // If current interval overlaps with the last merged interval
    if (current[0] <= lastMerged[1]) {
      // Merge them by updating the end time of the last merged interval
      lastMerged[1] = Math.max(lastMerged[1], current[1]);
    } else {
      // No overlap, add current interval to result
      result.push(current);
    }
  }
  
  return result;
}`,
        createdAt: new Date(2023, 5, 12),
        likes: 23,
        comments: [
          {
            id: "comment2",
            content: "Great sorting approach!",
            createdAt: new Date(2023, 5, 13),
            user: mockUsers[0]
          },
          {
            id: "comment3",
            content: "The explanation helped me understand the solution.",
            createdAt: new Date(2023, 5, 14),
            user: mockUsers[1]
          }
        ],
        likedByCurrentUser: false
      }
    ]
  }
];
