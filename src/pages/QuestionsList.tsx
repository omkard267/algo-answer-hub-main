
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import QuestionCard from "@/components/QuestionCard";
import { useQuestions } from "@/contexts/QuestionsContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Difficulty } from "@/lib/types";
import { Search, X } from "lucide-react";

const QuestionsList = () => {
  const location = useLocation();
  const { filterQuestions } = useQuestions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | undefined>();
  const [filteredQuestions, setFilteredQuestions] = useState(filterQuestions("", [], undefined));

  // Extract common tags from all questions
  const allTags = Array.from(
    new Set(
      filterQuestions("", [], undefined).flatMap((question) => question.tags)
    )
  );

  // Handle URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    const difficulty = params.get("difficulty") as Difficulty | null;
    const tag = params.get("tag");

    if (q) setSearchTerm(q);
    if (difficulty) setSelectedDifficulty(difficulty);
    if (tag && !selectedTags.includes(tag)) setSelectedTags([tag]);
    
    applyFilters(q || "", tag ? [tag] : selectedTags, difficulty || undefined);
  }, [location.search]);

  const applyFilters = (search: string, tags: string[], difficulty?: Difficulty) => {
    setFilteredQuestions(filterQuestions(search, tags, difficulty));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchTerm, selectedTags, selectedDifficulty);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      const newTags = selectedTags.filter(t => t !== tag);
      setSelectedTags(newTags);
      applyFilters(searchTerm, newTags, selectedDifficulty);
    } else {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      applyFilters(searchTerm, newTags, selectedDifficulty);
    }
  };

  const toggleDifficulty = (difficulty: Difficulty) => {
    if (selectedDifficulty === difficulty) {
      setSelectedDifficulty(undefined);
      applyFilters(searchTerm, selectedTags, undefined);
    } else {
      setSelectedDifficulty(difficulty);
      applyFilters(searchTerm, selectedTags, difficulty);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedDifficulty(undefined);
    applyFilters("", [], undefined);
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return selectedDifficulty === difficulty 
          ? "bg-green-500 hover:bg-green-600" 
          : "bg-transparent text-green-500 border-green-500 hover:bg-green-500/10";
      case Difficulty.MEDIUM:
        return selectedDifficulty === difficulty 
          ? "bg-yellow-500 hover:bg-yellow-600" 
          : "bg-transparent text-yellow-500 border-yellow-500 hover:bg-yellow-500/10";
      case Difficulty.HARD:
        return selectedDifficulty === difficulty 
          ? "bg-red-500 hover:bg-red-600" 
          : "bg-transparent text-red-500 border-red-500 hover:bg-red-500/10";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSearch={(term) => {
        setSearchTerm(term);
        applyFilters(term, selectedTags, selectedDifficulty);
      }} />
      
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Questions</h1>
        
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title or description..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={clearFilters}
              disabled={!searchTerm && selectedTags.length === 0 && !selectedDifficulty}
            >
              Clear <X className="ml-1 h-4 w-4" />
            </Button>
          </form>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Difficulty</h3>
            <div className="flex gap-2 flex-wrap">
              {Object.values(Difficulty).map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={selectedDifficulty === difficulty ? "default" : "outline"}
                  onClick={() => toggleDifficulty(difficulty)}
                  className={getDifficultyColor(difficulty)}
                >
                  {difficulty}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Tags</h3>
            <div className="flex gap-2 flex-wrap">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {filteredQuestions.length} {filteredQuestions.length === 1 ? 'Question' : 'Questions'} Found
            </h2>
          </div>
          
          {filteredQuestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuestions.map((question) => (
                <QuestionCard key={question.id} question={question} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No questions found</h3>
              <p className="text-muted-foreground">
                Try changing your search criteria or clearing filters
              </p>
            </div>
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

export default QuestionsList;
