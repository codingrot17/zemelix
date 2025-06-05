import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export function FAQSection() {
  return (
    <section className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold mb-6 text-primary text-center">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible>
        <AccordionItem value="q1">
          <AccordionTrigger>How do I create an account?</AccordionTrigger>
          <AccordionContent>
            Click the "Sign Up" button at the top right and follow the instructions.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q2">
          <AccordionTrigger>Is there a fee to list my product or service?</AccordionTrigger>
          <AccordionContent>
            Listing is free! We only charge a small commission on successful sales.
          </AccordionContent>
        </AccordionItem>
        {/* Add more questions as needed */}
      </Accordion>
    </section>
  );
}
