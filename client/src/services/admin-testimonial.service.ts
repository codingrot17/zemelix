import { functions } from "@/lib/appwrite/client";
import type { Testimonial, TestimonialStatus } from "@/services/testimonial.service";

async function execute(operation:string,payload:Record<string,unknown>={}) {
 const result=await functions.createExecution("public-seller-profile",JSON.stringify({operation,...payload}));
 let body:Record<string,unknown>={};
 try{body=JSON.parse(result.responseBody||"{}")}catch{throw new Error("Unexpected server response.")}
 if(result.responseStatusCode<200||result.responseStatusCode>=300||body.ok!==true)throw new Error(typeof body.error==="string"?body.error:"Request failed.");
 return body;
}
export async function listTestimonialsForAdmin():Promise<Testimonial[]>{
 const b=await execute("listTestimonialsForAdmin");
 if(!Array.isArray(b.testimonials))throw new Error("Unexpected testimonials response.");
 return b.testimonials as Testimonial[];
}
export async function moderateTestimonial(id:string,status:TestimonialStatus):Promise<Testimonial>{
 const b=await execute("moderateTestimonial",{testimonialId:id,status});
 return b.testimonial as Testimonial;
}
