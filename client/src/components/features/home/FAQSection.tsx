import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const faqs = [
  { q: "What is Zemelix?", a: "Zemelix is a marketplace where people can discover products, connect with sellers and creators, and request services from independent providers." },
  { q: "How do I create an account?", a: <>Choose Sign Up in the header and follow the registration steps. You can then manage your account and activity from your dashboard.</> },
  { q: "How can I buy a product?", a: "Browse the marketplace, open a product listing and follow the available purchase or contact options shown on that listing." },
  { q: "How do I book a service?", a: "Open a service listing, select Book Now, complete the booking request and check your dashboard for its status and provider response." },
  { q: "How do I sell products or offer services?", a: <>Open vendor onboarding to choose your vendor type and complete your profile. <Link to="/vendor/upgrade" className="font-semibold text-indigo-600 underline dark:text-indigo-300">Start onboarding</Link>.</> },
  { q: "Can I contact a seller directly?", a: "Yes. Use the contact option provided on a listing. Service listings may use the booking request flow." },
  { q: "What if I need help?", a: <>Use the chat button at the bottom of the page for quick answers or, after signing in, send a message to the support team. You can also visit <Link to="/support" className="font-semibold text-indigo-600 underline dark:text-indigo-300">Support</Link>.</> },
  { q: "Is listing free and are payments handled by Zemelix?", a: "Available fees, payment methods and transaction arrangements depend on the current marketplace flow. Review the information shown in the listing and checkout before committing; contact support if anything is unclear." },
];

export function FAQSection() {
  return <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6"><h2 className="mb-2 text-center text-2xl font-semibold text-primary">Frequently Asked Questions</h2><p className="mb-6 text-center text-sm text-muted-foreground">Quick answers about buying, booking and selling on Zemelix.</p><Accordion type="single" collapsible>{faqs.map((faq,index)=><AccordionItem key={faq.q} value={`faq-${index}`}><AccordionTrigger>{faq.q}</AccordionTrigger><AccordionContent>{faq.a}</AccordionContent></AccordionItem>)}</Accordion></section>;
}
