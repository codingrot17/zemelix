import { Button } from "@/components/ui/button";

export function CallToActionSection() {
  return (
    <section className="py-16 bg-primary dark:bg-secondary text-white text-center">
      <h2 className="text-3xl dark:text-primary font-bold mb-4">Ready to get started?</h2>
      <p className="mb-6 text-lg">Join our community and unlock new opportunities today.</p>
      <Button size="lg" className="bg-secondary dark:bg-primary text-primary dark:text-secondary hover:bg-gray-100">
        Sign Up Free
      </Button>
    </section>
  );
}
