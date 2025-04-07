
import React from "react";
import { Link } from "react-router-dom";
import { Question } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface QuestionCardProps {
  question: Question;
}

const QuestionCard = ({ question }: QuestionCardProps) => {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="h-full hover:shadow-md transition-all">
      <Link to={`/questions/${question.id}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl hover:text-primary transition-colors">
              {question.title}
            </CardTitle>
            <Badge className={`${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-muted-foreground line-clamp-3">
            {question.description}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <div className="flex flex-wrap gap-2">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(question.createdAt)}
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default QuestionCard;
