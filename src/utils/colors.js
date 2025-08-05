// src/utils/colors.js
export const getColorBySport = (sport) => {
  const sportColors = {
    soccer: 'bg-blue-100',
    basketball: 'bg-orange-100',
    football: 'bg-emerald-50',
    baseball: 'bg-red-100',
    tennis: 'bg-yellow-100',
    swimming: 'bg-slate-100',
    volleyball: 'bg-violet-200',
    hockey: 'bg-gray-100',
    lacrosse: 'bg-cyan-100',
    default: 'bg-pink-100',
  };

  const color = sportColors[sport.toLowerCase()] || sportColors.default;
  return `${color} text-gray-800`;
};
