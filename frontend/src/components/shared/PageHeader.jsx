import React from 'react';

/**
 * Reusable gradient page header with title and optional actions
 * Centralizes the gradient header pattern used across multiple pages
 */
const PageHeader = ({ title, subtitle, actions, gradient = "from-purple-800 via-orange-500 to-yellow-400" }) => {
  return (
    <div className={`mb-6 bg-gradient-to-tr ${gradient} rounded-lg p-6 shadow-md`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-white/80 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
