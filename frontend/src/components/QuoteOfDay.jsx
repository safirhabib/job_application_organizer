import React, { useMemo } from "react";

const QUOTES = [
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    text: "Opportunities don't happen. You create them.",
    author: "Chris Grosser",
  },
  {
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
  },
  {
    text: "Dreams don’t work unless you do.",
    author: "John C. Maxwell",
  },
  {
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
  },
];

function getDailyIndex() {
  const now = new Date();
  const seed = now.getFullYear() * 1000 + now.getMonth() * 50 + now.getDate();
  return seed % QUOTES.length;
}

export default function QuoteOfDay() {
  const quote = useMemo(() => QUOTES[getDailyIndex()], []);

  return (
    <div className="quoteCard">
      <div className="quoteLabel">Quote of the Day</div>
      <p className="quoteText">
        <span className="quoteHighlight">“{quote.text}”</span>
      </p>
      <span className="quoteAuthor">— {quote.author}</span>
    </div>
  );
}

