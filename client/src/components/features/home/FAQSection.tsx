import { Link } from "react-router-dom";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const faqs = [
  { q: "What is Zemelix?", a: "Zemelix is a marketplace where people can discover products and services offered by independent sellers and service providers." },
  { q: "How do I create an account?", a: "Choose Sign Up from the account menu, create your account, and follow any verification steps shown." },
  { q: "How do I buy a product?", a: "Browse the marketplace, open a product listing to review its details, and use the available cart or seller-contact option. Confirm details with the seller before arranging payment or delivery." },
  { q: "How do service bookings work?", a: "Open a service listing, choose Book Now, and submit a booking request. The provider can review and respond to the request from their dashboard." },
  { q: "How do I sell products or offer services?", a: "Sign in and choose Become a vendor to complete the guided setup. Select the correct vendor type and provide your business details." },
  { q: "Can I contact a seller directly?", a: "Yes. Use the contact option shown on a product listing. For a service, use the booking flow so the provider receives your request." },
  { q: "Where can I see my orders and bookings?", a: "Sign in and open your dashboard. Your customer dashboard includes order and booking sections." },
  { q: "Does Zemelix charge a listing or transaction fee?", a: "Check the current listing and any checkout or booking information for applicable terms. If something is unclear, ask support before proceeding." },
  { q: "How do I get help with my account or an order?", a: "Use the Chat with Us button to browse quick answers or send a message to the support team. Never share your password or one-time verification codes." },
];

export function FAQSection() {
  return <section id="faq" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    <h2 className="mb-3 text-center text-2xl font-bold text-primary sm:text-3xl">Frequently Asked Questions</h2>
    <p className="mb-7 text-center text-sm text-muted-foreground">Quick answers about buying, bookings, and setting up your business.</p>
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => <AccordionItem key={faq.q} value={`q${index + 1}`}><AccordionTrigger>{faq.q}</AccordionTrigger><AccordionContent>{faq.a}</AccordionContent></AccordionItem>)}
    </Accordion>
    <p className="mt-5 text-center text-sm text-muted-foreground">Still need help? <Link to="/support" className="font-semibold text-indigo-600 underline dark:text-indigo-300">Visit Support</Link> or use the chat button.</p>
  </section>;
}
