import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get(
      'https://api.themoviedb.org/3/discover/movie?with_original_language=ml&primary_release_year=2025',
      {
        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
      }
    );

    const movies = data.results;
    res.json({ success: true, movies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to add a new show to the database
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findById(movieId);

    // Fetch movie from TMDB if not in local DB
    if (!movie) {
      let movieDetailsResponse, movieCreditsResponse;

      try {
        [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
          axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
            headers: {
              Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
          }),
          axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}/credits`,
            {
              headers: {
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
              },
            }
          ),
        ]);
      } catch (apiError) {
        console.error("TMDB fetch failed:", apiError.message);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch movie data from TMDB.",
        });
      }

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      const movieDetails = {
        _id: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path,
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      };

      movie = await Movie.create(movieDetails);
    }

    // Create show documents
    const showsToCreate = [];

    showsInput.forEach((show) => {
      const showDate = show.date;

      show.time.forEach((time) => {
        const dateTimeString = `${showDate}T${time}`;

        showsToCreate.push({
          movie: movieId,
          showDateTime: new Date(dateTimeString),
          showPrice,
          occupiedSeats: {},
        });
      });
    });

    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate); 
    }

    res.json({
      success: true,
      message: "Show Added successfully.",
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all shows from the database
// export const getShows = async (req, res) => {
//   try {
//     // Fetch all shows whose showDateTime is in the future or today
//     const shows = await Show.find({
//       showDateTime: { $gte: new Date() }
//     })
//       .populate('movie')  // Populate movie details from Movie model
//       .sort({ showDateTime: 1 }); // Sort shows in ascending order of show time

//     // Extract unique movies from the shows
//     const uniqueShows = new Set(shows.map(show => show.movie));

//     // Respond with the list of unique movies
//     res.json({ success: true, shows: Array.from(uniqueShows) });

//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };
export const getShows = async (req, res) => {
  try {
    // TEMP: remove the date filter to see if any shows exist
    const shows = await Show.find().populate('movie');

    const seen = new Set();
    const uniqueMovies = [];

    for (const show of shows) {
      const movie = show.movie;
      if (movie && !seen.has(movie._id.toString())) {
        seen.add(movie._id.toString());
        uniqueMovies.push(movie);
      }
    }

    res.json({ success: true, shows: uniqueMovies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};



// API to get a single show's upcoming shows grouped by date
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;

    // Get all upcoming shows for the movie
    const shows = await Show.find({
      movie: movieId,
      showDateTime: { $gte: new Date() }
    });

    // Get movie details
    const movie = await Movie.findById(movieId);

    // if (!movie) {
    //   return res.status(404).json({ success: false, message: 'Movie not found' });
    // }

    // Group showtimes by date
    const dateTime = {};
    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split('T')[0]; // Extract date in YYYY-MM-DD format

      if (!dateTime[date]) {
        dateTime[date] = [];
      }

      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id
      });
    });

    res.json({
      success: true,
      movie,
      dateTime
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
