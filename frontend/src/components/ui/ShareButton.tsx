import React from 'react';
import { SimOptions } from '../../types/SimOptions';
import { encodeSimOptionsToURL } from '../../utils/simOptionsURL';

type ShareButtonProps = {
  simOptions: SimOptions;
};

const ShareButton: React.FC<ShareButtonProps> = ({ simOptions }) => {
  const handleCopy = () => {
    const encoded = encodeSimOptionsToURL(simOptions);
    const url = `${window.location.origin}?sim=${encoded}`;
    navigator.clipboard.writeText(url)
      .then(() => alert('✅ URL copied to clipboard!'))
      .catch(() => alert('❌ Failed to copy URL.'));
  };

  return (
    <button onClick={handleCopy} className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow">
      Share this waveform
    </button>
  );
};

export default ShareButton;
