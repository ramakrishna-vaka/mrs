import express from 'express';
import cors from 'cors';
import fs from 'fs';
import csv from 'csv-parser';

const app = express();
app.use(cors());
app.use(express.json());

// Paths to the dataset and similarity files
const datasetPath = '../dataset.csv';
const similarityPath = '../similarity.csv';

// Load dataset into memory
let dataset = [];
fs.createReadStream(datasetPath)
  .pipe(csv())
  .on('data', (row) => {
    dataset.push(row);
  })
  .on('end', () => {
    console.log('Dataset loaded successfully');
  })
  .on('error', (error) => {
    console.error('Error reading dataset:', error);
  });

// Load similarity matrix into memory
let similarity = [];
fs.createReadStream(similarityPath)
  .pipe(csv())
  .on('data', (row) => {
    const similarityRow = Object.values(row).map(Number); // Convert values to numbers
    similarity.push(similarityRow);
  })
  .on('end', () => {
    console.log('Similarity matrix loaded successfully');
  })
  .on('error', (error) => {
    console.error('Error reading similarity file:', error);
  });

// Endpoint to fetch movie titles
app.get('/get-titles', (req, res) => {
  try {
    const titles = dataset.map((movie) => movie.title); // Adjust 'title' based on your dataset column
    res.json({ titles });
  } catch (error) {
    console.error('Error fetching titles:', error);
    res.status(500).json({ error: 'Failed to fetch titles' });
  }
});

// Endpoint to fetch recommendations for a selected movie
app.post('/recommend-movie', (req, res) => {
  const { movie } = req.body;

  // Validate the movie
  const movieIndex = dataset.findIndex((item) => item.title === movie);
  if (movieIndex === -1) {
    return res.status(404).json({ error: 'Movie not found in dataset' });
  }

  try {
    // Fetch similarity scores and sort to find the top 5 recommendations
    const distances = similarity[movieIndex];
    const movieList = distances
      .map((score, idx) => ({ index: idx, score }))
      .sort((a, b) => b.score - a.score)
      .slice(1, 6); // Exclude the movie itself

    const recommendations = movieList.map(({ index }) => dataset[index].title);
    res.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
