import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CodeBlock from "@/components/CodeBlock";
import { useQuestions } from "@/contexts/QuestionsContext";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getQuestionById, addComment, toggleLike } = useQuestions();
  const { isAuthenticated, currentUser } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [activeSolution, setActiveSolution] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const question = getQuestionById(id!);

  if (!question) {
    return <Navigate to="/questions" replace />;
  }

  useEffect(() => {
    if (!activeSolution && question.solutions.length > 0) {
      setActiveSolution(question.solutions[0].id);
    }
  }, [question, activeSolution]);

  const handleSubmitComment = async (solutionId: string) => {
    if (!newComment.trim() || !isAuthenticated) {
      toast({
        title: "Error",
        description: "Please log in and enter a comment",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addComment(question.id, solutionId, newComment);
      setNewComment("");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (solutionId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like solutions",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await toggleLike(question.id, solutionId);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500 hover:bg-green-600";
      case "Medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Hard":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{question.title}</h1>
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty}
            </Badge>
          </div>
          
          <div className="flex gap-2 mt-2 mb-4 flex-wrap">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="prose max-w-none dark:prose-invert">
                <ReactMarkdown>{question.description}</ReactMarkdown>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Posted: {formatDate(question.createdAt)}
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Solutions</h2>
          
          {question.solutions.length > 0 ? (
            <Tabs 
              defaultValue={question.solutions[0].id} 
              value={activeSolution || undefined}
              onValueChange={setActiveSolution}
              className="mb-8"
            >
              <TabsList className="mb-4 overflow-x-auto flex whitespace-nowrap">
                {question.solutions.map((solution) => (
                  <TabsTrigger key={solution.id} value={solution.id}>
                    {solution.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {question.solutions.map((solution) => (
                <TabsContent key={solution.id} value={solution.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{solution.title}</CardTitle>
                      <CardDescription>
                        Posted: {formatDate(solution.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="prose max-w-none dark:prose-invert">
                        <ReactMarkdown>{solution.content}</ReactMarkdown>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Implementation:</h3>
                        <CodeBlock code={solution.code} language="typescript" showLineNumbers={true} />
                      </div>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between">
                      <div className="flex items-center">
                        <Button
                          variant={solution.likedByCurrentUser ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleLike(solution.id)}
                          disabled={!isAuthenticated || isSubmitting}
                        >
                          {solution.likedByCurrentUser ? "Liked" : "Like"} ({solution.likes})
                        </Button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {solution.comments.length} comments
                      </div>
                    </CardFooter>
                  </Card>
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Comments</h3>
                    
                    {isAuthenticated ? (
                      <div className="mb-6">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="mb-2"
                          disabled={isSubmitting}
                        />
                        <Button 
                          onClick={() => handleSubmitComment(solution.id)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Adding..." : "Add Comment"}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground mb-6">
                        Please log in to add comments.
                      </p>
                    )}
                    
                    {solution.comments.length > 0 ? (
                      <div className="space-y-4">
                        {solution.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={comment.user.avatarUrl} />
                              <AvatarFallback>
                                {comment.user.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{comment.user.username}</h4>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="mt-1">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No comments yet.</p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No solutions have been added yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <footer className="border-t py-6">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} AlgoAnswerHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default QuestionDetail;
