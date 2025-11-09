"use client";

import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPersonalizedRecommendations } from "@/ai/flows/personalized-recommendations";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGetRecommendations() {
    setLoading(true);
    setRecommendations("");
    try {
      const result = await getPersonalizedRecommendations({
        userHistory: "Viewed courses on web development and data science, previously bought an ergonomic keyboard and a smartwatch.",
        userPreferences: "Interested in technology, programming, productivity tools, and personal health.",
      });
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      setRecommendations("Sorry, we couldn't fetch recommendations at this time. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>
            AI-powered suggestions just for you.
          </CardDescription>
        </div>
        <Button onClick={handleGetRecommendations} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate
        </Button>
      </CardHeader>
      <CardContent>
        <div className="min-h-[6rem] p-4 bg-muted rounded-lg flex items-center justify-center">
          {loading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
          {!loading && recommendations && (
            <p className="text-center text-foreground">{recommendations}</p>
          )}
          {!loading && !recommendations && (
            <p className="text-center text-muted-foreground">
              Click "Generate" to see your personalized recommendations.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
