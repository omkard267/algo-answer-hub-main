
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestions } from "@/contexts/QuestionsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Difficulty } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { addQuestion, addSolution, questions } = useQuestions();
  const { toast } = useToast();
  
  // Question form state
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionDescription, setQuestionDescription] = useState("");
  const [questionDifficulty, setQuestionDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [questionTags, setQuestionTags] = useState("");
  
  // Solution form state
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [solutionTitle, setSolutionTitle] = useState("");
  const [solutionContent, setSolutionContent] = useState("");
  const [solutionCode, setSolutionCode] = useState("");

  // If not authenticated or not admin, redirect to home
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionTitle || !questionDescription || !questionTags) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Split tags by comma and trim whitespace
    const tagsArray = questionTags.split(",").map(tag => tag.trim()).filter(tag => tag);
    
    addQuestion({
      title: questionTitle,
      description: questionDescription,
      difficulty: questionDifficulty,
      tags: tagsArray,
    });
    
    // Clear form
    setQuestionTitle("");
    setQuestionDescription("");
    setQuestionDifficulty(Difficulty.EASY);
    setQuestionTags("");
  };

  const handleAddSolution = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedQuestion || !solutionTitle || !solutionContent || !solutionCode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    addSolution(selectedQuestion, {
      title: solutionTitle,
      content: solutionContent,
      code: solutionCode,
    });
    
    // Clear form
    setSelectedQuestion("");
    setSolutionTitle("");
    setSolutionContent("");
    setSolutionCode("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="questions">Add Question</TabsTrigger>
            <TabsTrigger value="solutions">Add Solution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Add New Question</CardTitle>
                <CardDescription>
                  Create a new coding challenge for users to solve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddQuestion} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-title">Title</Label>
                    <Input
                      id="question-title"
                      placeholder="e.g. Two Sum"
                      value={questionTitle}
                      onChange={(e) => setQuestionTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="question-description">Description</Label>
                    <Textarea
                      id="question-description"
                      placeholder="Describe the problem in detail. You can use Markdown."
                      className="min-h-[150px]"
                      value={questionDescription}
                      onChange={(e) => setQuestionDescription(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Supports markdown formatting
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="question-difficulty">Difficulty</Label>
                      <Select
                        value={questionDifficulty}
                        onValueChange={(value) => setQuestionDifficulty(value as Difficulty)}
                      >
                        <SelectTrigger id="question-difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Difficulty.EASY}>Easy</SelectItem>
                          <SelectItem value={Difficulty.MEDIUM}>Medium</SelectItem>
                          <SelectItem value={Difficulty.HARD}>Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="question-tags">Tags</Label>
                      <Input
                        id="question-tags"
                        placeholder="e.g. Array, Hash Table, Two Pointers"
                        value={questionTags}
                        onChange={(e) => setQuestionTags(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate tags with commas
                      </p>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Add Question
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="solutions">
            <Card>
              <CardHeader>
                <CardTitle>Add Solution</CardTitle>
                <CardDescription>
                  Create a solution for an existing question
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSolution} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-select">Select Question</Label>
                    <Select
                      value={selectedQuestion}
                      onValueChange={setSelectedQuestion}
                    >
                      <SelectTrigger id="question-select">
                        <SelectValue placeholder="Select a question" />
                      </SelectTrigger>
                      <SelectContent>
                        {questions.map((question) => (
                          <SelectItem key={question.id} value={question.id}>
                            {question.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="solution-title">Solution Title</Label>
                    <Input
                      id="solution-title"
                      placeholder="e.g. O(n) Solution with HashMap"
                      value={solutionTitle}
                      onChange={(e) => setSolutionTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="solution-content">Explanation</Label>
                    <Textarea
                      id="solution-content"
                      placeholder="Explain your solution approach. You can use Markdown."
                      className="min-h-[100px]"
                      value={solutionContent}
                      onChange={(e) => setSolutionContent(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Supports markdown formatting
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="solution-code">Code Implementation</Label>
                    <Textarea
                      id="solution-code"
                      placeholder="// Your code here"
                      className="min-h-[200px] font-code"
                      value={solutionCode}
                      onChange={(e) => setSolutionCode(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Add Solution
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
