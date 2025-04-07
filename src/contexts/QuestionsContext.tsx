import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Question, Solution, Comment, Difficulty } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface QuestionsContextType {
  questions: Question[];
  isLoading: boolean;
  error: Error | null;
  addQuestion: (question: Omit<Question, "id" | "createdAt" | "solutions">) => Promise<void>;
  addSolution: (questionId: string, solution: Omit<Solution, "id" | "createdAt" | "likes" | "comments" | "likedByCurrentUser">) => Promise<void>;
  addComment: (questionId: string, solutionId: string, content: string) => Promise<void>;
  toggleLike: (questionId: string, solutionId: string) => Promise<void>;
  getQuestionById: (id: string) => Question | undefined;
  filterQuestions: (searchTerm: string, tags: string[], difficulty?: Difficulty) => Question[];
}

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export const useQuestions = () => {
  const context = useContext(QuestionsContext);
  if (context === undefined) {
    throw new Error("useQuestions must be used within a QuestionsProvider");
  }
  return context;
};

interface QuestionsProviderProps {
  children: ReactNode;
}

export const QuestionsProvider = ({ children }: QuestionsProviderProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all questions and transform them to the Question type
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        // Fetch questions with solutions, comments, and likes
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false });

        if (questionsError) {
          throw new Error(questionsError.message);
        }

        if (!questionsData) {
          setQuestions([]);
          return;
        }

        // Transform data to our Question type with empty solutions array
        const transformedQuestions: Question[] = await Promise.all(
          questionsData.map(async (q) => {
            // Fetch solutions for this question
            const { data: solutionsData, error: solutionsError } = await supabase
              .from('solutions')
              .select('*')
              .eq('question_id', q.id)
              .order('created_at', { ascending: false });

            if (solutionsError) {
              console.error("Error fetching solutions:", solutionsError);
              return {
                id: q.id,
                title: q.title,
                description: q.description,
                difficulty: q.difficulty as Difficulty,
                tags: q.tags || [],
                createdAt: new Date(q.created_at),
                images: q.images || [],
                solutions: []
              };
            }

            // Transform solutions and fetch comments and likes for each
            const transformedSolutions: Solution[] = await Promise.all(
              (solutionsData || []).map(async (s) => {
                // Fetch user profile for solution
                const { data: userProfile, error: userError } = await supabase
                  .from('profiles')
                  .select('username, avatar_url, is_admin')
                  .eq('id', s.user_id)
                  .single();
                
                if (userError) {
                  console.error("Error fetching user profile:", userError);
                }

                // Fetch comments for this solution
                const { data: commentsData, error: commentsError } = await supabase
                  .from('comments')
                  .select(`
                    id,
                    content,
                    created_at,
                    user_id
                  `)
                  .eq('solution_id', s.id)
                  .order('created_at', { ascending: true });

                if (commentsError) {
                  console.error("Error fetching comments:", commentsError);
                  return {
                    id: s.id,
                    title: s.title,
                    content: s.content,
                    code: s.code,
                    createdAt: new Date(s.created_at),
                    images: s.images || [],
                    likes: s.likes || 0,
                    comments: [],
                    likedByCurrentUser: false
                  };
                }

                // Fetch user details separately for each comment
                const transformedComments: Comment[] = await Promise.all((commentsData || []).map(async (c) => {
                  // Get user profile for this comment
                  const { data: userProfile, error: userError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', c.user_id)
                    .single();
                    
                  if (userError) {
                    console.error("Error fetching user profile:", userError);
                    return {
                      id: c.id,
                      content: c.content,
                      createdAt: new Date(c.created_at),
                      user: {
                        id: c.user_id,
                        username: 'Unknown',
                        email: '',
                        isAdmin: false,
                        avatarUrl: ''
                      }
                    };
                  }

                  return {
                    id: c.id,
                    content: c.content,
                    createdAt: new Date(c.created_at),
                    user: {
                      id: userProfile.id,
                      username: userProfile.username,
                      email: '', // Email is not included for privacy
                      isAdmin: userProfile.is_admin,
                      avatarUrl: userProfile.avatar_url
                    }
                  };
                }));

                // Check if current user liked this solution
                let likedByCurrentUser = false;
                if (currentUser) {
                  const { data: likeData } = await supabase
                    .from('likes')
                    .select('id')
                    .eq('solution_id', s.id)
                    .eq('user_id', currentUser.id)
                    .limit(1);
                  
                  likedByCurrentUser = likeData && likeData.length > 0;
                }

                return {
                  id: s.id,
                  title: s.title,
                  content: s.content,
                  code: s.code,
                  createdAt: new Date(s.created_at),
                  images: s.images || [],
                  likes: s.likes || 0,
                  comments: transformedComments,
                  likedByCurrentUser
                };
              })
            );

            return {
              id: q.id,
              title: q.title,
              description: q.description,
              difficulty: q.difficulty as Difficulty,
              tags: q.tags || [],
              createdAt: new Date(q.created_at),
              images: q.images || [],
              solutions: transformedSolutions
            };
          })
        );

        setQuestions(transformedQuestions);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        toast({
          title: "Error",
          description: "Failed to load questions. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [currentUser, toast]);

  const addQuestion = async (questionData: Omit<Question, "id" | "createdAt" | "solutions">) => {
    try {
      if (!isAuthenticated || !currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please log in to add a question.",
          variant: "destructive"
        });
        return;
      }

      if (!currentUser.isAdmin) {
        toast({
          title: "Permission Denied",
          description: "Only admins can add questions.",
          variant: "destructive"
        });
        return;
      }

      const { data: newQuestion, error } = await supabase
        .from('questions')
        .insert({
          title: questionData.title,
          description: questionData.description,
          difficulty: questionData.difficulty,
          tags: questionData.tags,
          images: questionData.images || []
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!newQuestion) {
        throw new Error("Failed to create question");
      }

      // Update local state
      setQuestions(prevQuestions => [
        {
          id: newQuestion.id,
          title: newQuestion.title,
          description: newQuestion.description,
          difficulty: newQuestion.difficulty as Difficulty,
          tags: newQuestion.tags || [],
          createdAt: new Date(newQuestion.created_at),
          images: newQuestion.images || [],
          solutions: []
        },
        ...prevQuestions
      ]);

      toast({
        title: "Question Added",
        description: "Your question has been successfully added."
      });
    } catch (err) {
      console.error("Error adding question:", err);
      toast({
        title: "Error",
        description: "Failed to add question. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addSolution = async (questionId: string, solutionData: Omit<Solution, "id" | "createdAt" | "likes" | "comments" | "likedByCurrentUser">) => {
    try {
      if (!isAuthenticated || !currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please log in to add a solution.",
          variant: "destructive"
        });
        return;
      }
      
      console.log("Adding solution with:", {
        questionId,
        userId: currentUser.id,
        title: solutionData.title,
        content: solutionData.content,
        code: solutionData.code
      });

      // Create the solution object to insert
      const solutionToInsert = {
        question_id: questionId,
        title: solutionData.title,
        content: solutionData.content,
        code: solutionData.code,
        images: solutionData.images || [],
        user_id: currentUser.id
      };

      // Insert the solution
      const { data: newSolution, error } = await supabase
        .from('solutions')
        .insert(solutionToInsert)
        .select()
        .single();

      if (error) {
        console.error("Error inserting solution:", error);
        throw new Error(error.message);
      }

      if (!newSolution) {
        throw new Error("Failed to create solution");
      }
      
      console.log("Solution created successfully:", newSolution);

      // Update local state
      setQuestions(prevQuestions =>
        prevQuestions.map(question => {
          if (question.id === questionId) {
            const newSolutionEntry: Solution = {
              id: newSolution.id,
              title: newSolution.title,
              content: newSolution.content,
              code: newSolution.code,
              createdAt: new Date(newSolution.created_at),
              images: newSolution.images || [],
              likes: 0,
              comments: [],
              likedByCurrentUser: false
            };

            return {
              ...question,
              solutions: [newSolutionEntry, ...question.solutions]
            };
          }
          return question;
        })
      );

      toast({
        title: "Solution Added",
        description: "Your solution has been successfully added."
      });
      
      // Force refresh the questions data to ensure consistency
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      console.error("Error adding solution:", err);
      toast({
        title: "Error",
        description: `Failed to add solution: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  const addComment = async (questionId: string, solutionId: string, content: string) => {
    try {
      if (!isAuthenticated || !currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please log in to add comments.",
          variant: "destructive"
        });
        return;
      }

      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          solution_id: solutionId,
          content: content,
          user_id: currentUser.id
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!newComment) {
        throw new Error("Failed to create comment");
      }

      // Update local state
      setQuestions(prevQuestions =>
        prevQuestions.map(question => {
          if (question.id === questionId) {
            return {
              ...question,
              solutions: question.solutions.map(solution => {
                if (solution.id === solutionId) {
                  const newCommentEntry: Comment = {
                    id: newComment.id,
                    content: newComment.content,
                    createdAt: new Date(newComment.created_at),
                    user: currentUser
                  };

                  return {
                    ...solution,
                    comments: [...solution.comments, newCommentEntry]
                  };
                }
                return solution;
              })
            };
          }
          return question;
        })
      );

      toast({
        title: "Comment Added",
        description: "Your comment has been successfully added."
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (questionId: string, solutionId: string) => {
    try {
      if (!isAuthenticated || !currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please log in to like solutions.",
          variant: "destructive"
        });
        return;
      }

      // Find the solution and check if it's already liked
      const question = questions.find(q => q.id === questionId);
      const solution = question?.solutions.find(s => s.id === solutionId);

      if (!solution) {
        throw new Error("Solution not found");
      }

      if (solution.likedByCurrentUser) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('solution_id', solutionId)
          .eq('user_id', currentUser.id);

        if (error) {
          throw new Error(error.message);
        }

        // Decrease likes count in solutions table
        await supabase
          .from('solutions')
          .update({ likes: solution.likes - 1 })
          .eq('id', solutionId);

      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({
            solution_id: solutionId,
            user_id: currentUser.id
          });

        if (error) {
          throw new Error(error.message);
        }

        // Increase likes count in solutions table
        await supabase
          .from('solutions')
          .update({ likes: solution.likes + 1 })
          .eq('id', solutionId);
      }

      // Update local state
      setQuestions(prevQuestions =>
        prevQuestions.map(question => {
          if (question.id === questionId) {
            return {
              ...question,
              solutions: question.solutions.map(solution => {
                if (solution.id === solutionId) {
                  return {
                    ...solution,
                    likes: solution.likedByCurrentUser 
                      ? solution.likes - 1 
                      : solution.likes + 1,
                    likedByCurrentUser: !solution.likedByCurrentUser
                  };
                }
                return solution;
              })
            };
          }
          return question;
        })
      );
      
    } catch (err) {
      console.error("Error toggling like:", err);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getQuestionById = (id: string) => {
    return questions.find(question => question.id === id);
  };

  const filterQuestions = (searchTerm: string, tags: string[], difficulty?: Difficulty) => {
    return questions.filter(question => {
      // Filter by search term
      const matchesSearch = searchTerm === "" || 
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        question.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by tags
      const matchesTags = tags.length === 0 || 
        tags.some(tag => question.tags.includes(tag));

      // Filter by difficulty
      const matchesDifficulty = !difficulty || 
        question.difficulty === difficulty;

      return matchesSearch && matchesTags && matchesDifficulty;
    });
  };

  return (
    <QuestionsContext.Provider 
      value={{ 
        questions, 
        isLoading,
        error,
        addQuestion, 
        addSolution,
        addComment,
        toggleLike,
        getQuestionById,
        filterQuestions
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
};
