import React, { useState } from 'react';
import { dummyTrailers } from '../assets/assets'; // adjust path if needed

const convertToEmbedUrl = (url) => {
  return url.replace("watch?v=", "embed/");
};

const TrailerSection = () => {
  const [selectedTrailer, setSelectedTrailer] = useState(dummyTrailers[0]);

  return (
    <div className="text-white px-4">
      <h2 className="text-xl font-semibold mb-4">Trailers</h2>

      {/* Video Player */}
      <div className="w-full flex justify-center mb-6">
        {selectedTrailer && (
          <iframe
            className="rounded-md"
            src={convertToEmbedUrl(selectedTrailer.videoUrl)}
            title="Trailer"
            width="960"
            height="540"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        )}
      </div>

      {/* Thumbnail List */}
      <div className="flex gap-4 overflow-x-auto px-100">
        {dummyTrailers.map((trailer, index) => (
          <div
            key={index}
            className="cursor-pointer min-w-[160px] hover:scale-105 transition"
            onClick={() => setSelectedTrailer(trailer)}
          >
            <img
              src={trailer.image}
              alt={`Trailer ${index + 1}`}
              className="rounded-lg w-full h-24 object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailerSection;

