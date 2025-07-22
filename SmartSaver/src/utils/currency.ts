import { useProfile } from '../hooks/useProfile';
import { DollarSign } from 'lucide-react';
import { IndianRupee } from 'lucide-react';
import { PoundSterling } from 'lucide-react';
import { Euro } from 'lucide-react';

import React from 'react';


const countryCodes: { [key: string]: string } = {
  'United States': 'US',
  'Canada': 'CA',
  'United Kingdom': 'UK',
  'India': 'IN',
  'Australia': 'AU',
  'European Union': 'EU',
  // Add more country names and codes as needed
};

const currencySymbols: { [key: string]: string } = {
  'US': '$',
  'CA': '$',
  'EU': '€',
  'UK': '£',
  'IN': '₹',
  'AU': '$',
  // Add more countries and currency symbols as needed
};
const currencyIcons: { [key: string]: React.JSX.Element } = {
  'US': React.createElement(DollarSign, { className: "w-6 h-6 text-white" }),
  'CA': React.createElement(DollarSign, { className: "w-6 h-6 text-white" }),
  'EU': React.createElement(Euro, { className: "w-6 h-6 text-white" }),
  'UK': React.createElement(PoundSterling, { className: "w-6 h-6 text-white" }),
  'IN': React.createElement(IndianRupee, { className: "w-6 h-6 text-white" }),
  'AU': React.createElement(DollarSign, { className: "w-6 h-6 text-white" }),
  // Add more countries and currency icons as needed
};

const getCurrencySymbol = () => {
  const { profile } = useProfile();
  const location = profile?.location;
  const countryName = location?.split(',').pop()?.trim();
    if (countryName === undefined) {
    return '₹'; 
  }
  const countryCode = countryCodes[countryName];
  return currencySymbols[countryCode] || '₹'; // Default to '₹' if country code is not found
};

const getCurrencyIcon = () => {
  const { profile } = useProfile();
  const location = profile?.location;
  const countryName = location?.split(',').pop()?.trim();
  if (countryName === undefined) {
    return React.createElement(IndianRupee, { className: "w-6 h-6 text-white" }); 
  }
  const countryCode = countryCodes[countryName];
  return currencyIcons[countryCode] || React.createElement(IndianRupee, { className: "w-6 h-6 text-white" }); // Default to RupeeSign if country code is not found
};

export { getCurrencySymbol,getCurrencyIcon };