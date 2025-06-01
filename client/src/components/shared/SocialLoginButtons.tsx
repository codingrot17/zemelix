// nothing
import { Button } from "@/components/ui/button";
import { FaApple, FaGoogle } from 'react-icons/fa';

export default function SocialLoginButtons() {
  return (
    <div className="flex flex-col space-y-3 mb-6">
      <Button
        variant="outline"
        className="flex items-center justify-center space-x-2"
        onClick={() => alert("Google login flow here")}
      >
        <FaGoogle />
  

        <span>Continue with Google</span>
      </Button>

      <Button
        variant="outline"
        className="flex items-center justify-center space-x-2"
        onClick={() => alert("Apple login flow here")}
      >
        <FaApple />
        <span>Continue with Apple</span>
      </Button>
    </div>
  );
}
