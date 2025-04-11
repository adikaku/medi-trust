
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };
  
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div className="absolute inset-0 bg-primary rounded-full opacity-20"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-3/4 w-3/4 rounded-full border-4 border-primary flex items-center justify-center">
          <span className="text-primary font-bold" style={{ fontSize: size === "sm" ? "10px" : size === "md" ? "14px" : "18px" }}>
            MT
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;
