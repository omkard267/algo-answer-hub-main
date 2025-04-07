
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useQuestions } from "@/contexts/QuestionsContext";
import QuestionCard from "@/components/QuestionCard";
import { Button } from "@/components/ui/button";
import { Difficulty } from "@/lib/types";

const Index = () => {
  const { questions, filterQuestions } = useQuestions();

  // Get latest questions
  const latestQuestions = [...questions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6);
  
  // Get questions by difficulty
  const easyQuestions = filterQuestions("", [], Difficulty.EASY).slice(0, 4);
  const mediumQuestions = filterQuestions("", [], Difficulty.MEDIUM).slice(0, 4);
  const hardQuestions = filterQuestions("", [], Difficulty.HARD).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8">
        {/* Hero Section */}
        <section className="py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">AlgoAnswerHub</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Find, share, and discuss solutions to popular algorithmic problems from 
            platforms like LeetCode and CodeChef.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/questions">Browse Questions</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Join Community</Link>
            </Button>
          </div>
        </section>

        {/* Latest Questions */}
        <section className="py-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Latest Questions</h2>
            <Button variant="ghost" asChild>
              <Link to="/questions">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        </section>

        {/* Questions by Difficulty */}
        <section className="py-10">
          <h2 className="text-2xl font-bold mb-6">Questions by Difficulty</h2>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-green-500">Easy</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/questions?difficulty=Easy">More Easy</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {easyQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-yellow-500">Medium</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/questions?difficulty=Medium">More Medium</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mediumQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-red-500">Hard</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/questions?difficulty=Hard">More Hard</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hardQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} AlgoAnswerHub. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">Terms</Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link>
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
