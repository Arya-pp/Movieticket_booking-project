import React from 'react'
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import officerImg from '../assets/officer.jpg'

const Herosection = () => {
  const navigate = useNavigate()

  return (
    <div
      className="relative w-full min-h-[80vh] md:min-h-screen bg-cover bg-center bg-no-repeat flex items-center"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.1)), url(${officerImg})`
      }}
    >
      <div className="px-6 md:px-16 lg:px-36 text-white space-y-4">
        <h1 className="text-5xl md:text-[64px] leading-tight font-bold max-w-[600px]">
          Officer On Duty
        </h1>

        <div className="flex items-center gap-4 text-gray-300 text-sm">
          <span>Action | Thriller | Drama</span>

          <div className="flex items-center gap-1">
            <CalendarIcon className="w-4 h-4" /> 2024
          </div>

          <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" /> 2h 10m
          </div>
        </div>

        <p className="max-w-md text-gray-200 text-sm">
          A gripping action thriller following a determined officer who takes on a high-stakes mission to protect his city from an emerging threat.
        </p>

        <button
          onClick={() => navigate('/movies')}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dull transition rounded-full font-medium text-sm"
        >
          Explore Movies
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Herosection
