import { Star } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "text-blue-600" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Star className="w-8 h-8 fill-current" />
        <div className="absolute inset-0 animate-pulse">
          <Star className="w-8 h-8 fill-current opacity-50" />
        </div>
      </div>
      <span className="text-xl font-bold">HD</span>
    </div>
  );
};
