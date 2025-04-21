import React from "react";

interface Scheme {
  title: string;
  description: string;
  subsidy: string;
  eligibility: string;
  department: string;
  documents: string[];
  image: string;
}

interface SchemeCardProps {
  scheme: Scheme;
}

const SchemeCard: React.FC<SchemeCardProps> = ({ scheme }) => {
  return (
    <div
      className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700
        transition-transform transform hover:scale-105 hover:shadow-xl dark:hover:shadow-gray-900"
    >
      {/* ✅ Image with Rounded Corners */}
      <img
        src={scheme.image}
        alt={scheme.title}
        className="w-full h-40 object-cover rounded-md mb-3"
      />

      {/* ✅ Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{scheme.title}</h3>

      {/* ✅ Description */}
      <p className="text-gray-700 dark:text-gray-300">{scheme.description}</p>

      {/* ✅ Subsidy, Eligibility, and Department */}
      <p className="text-green-700 dark:text-green-400 font-semibold">Subsidy: {scheme.subsidy}</p>
      <p className="text-blue-600 dark:text-blue-300">Eligibility: {scheme.eligibility}</p>
      <p className="text-purple-700 dark:text-purple-400">Department: {scheme.department}</p>

      {/* ✅ Required Documents */}
      <details className="mt-2">
        <summary className="text-gray-800 dark:text-gray-200 font-medium cursor-pointer">
          Required Documents
        </summary>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
          {scheme.documents.map((doc, index) => (
            <li key={index}>{doc}</li>
          ))}
        </ul>
      </details>
    </div>
  );
};

export default SchemeCard;
