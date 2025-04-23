from nltk.sentiment.vader import SentimentIntensityAnalyzer
import sys
import json

# Initialize VADER sentiment analyzer
sid = SentimentIntensityAnalyzer()

# Get the text input from the command-line argument
text = sys.argv[1]

# Analyze the sentiment
sentiment = sid.polarity_scores(text)

# Return the sentiment result as JSON
print(json.dumps(sentiment))
