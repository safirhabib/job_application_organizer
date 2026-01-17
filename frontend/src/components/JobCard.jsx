import React from 'react';
import { AlertCircle } from 'lucide-react'; // Great for US6 visual flair

const JobCard = ({ job }) => {

  const isStale = job.is_stale();

  return (
    <div className={`p-4 m-2 rounded-lg shadow-sm border-2 ${isStale ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg">{job.company_name}</h3>
        
        {/* US6: The Alert Icon only shows if it is stale */}
        {isStale && (
          <div className="flex items-center gap-1 text-red-600 animate-pulse" title="No updates in 7+ days">
            <AlertCircle size={20} />
            Please follow up with this company
          </div>
        )}
      </div>
      
      <p className="text-gray-600">{job.role}</p>
      <p className="text-xs mt-2 text-gray-400">Applied on: {job.date_applied}</p>
    </div>
  );
};

export default JobCard;