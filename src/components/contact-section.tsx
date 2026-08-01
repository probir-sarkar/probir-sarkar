
import { FaLinkedin, FaGithubSquare, FaWhatsappSquare } from "react-icons/fa";
import { FaMedium } from "react-icons/fa6";
import ContactForm from "./contact-form";
import { Link } from "@tanstack/react-router";

const ContactSection = () => {
  return (
    <>
      <section className="pb-32 w-10/12 mx-auto md:mt-20" id="contact">
        <h2 className="xl:text-5xl  text-3xl font-bold py-8 leading-relaxed ">
          <span className="text-primary">Get in Touch</span> with me
        </h2>

        <div className="grid items-end lg:gap-40 gap-20 md:grid-cols-2 grid-cols-1">
          <div className="">
            <ContactForm />
          </div>
          <div className="space-y-6">
            <div className="grid gap-2">
              <h5 className={`text-xl font-semibold `}>Location</h5>
              <p>Mohali, India</p>
            </div>
            <div className="grid gap-2">
              <h5 className={`text-xl font-semibold `}>Talk to me</h5>
              <div className="grid">
                <Link to="tel:+91-951-154-9471">+91-951-154-9471</Link>
                <Link to="mailto:me@probirsarkar.com">
                  me@probirsarkar.com
                </Link>
              </div>
            </div>
            <div className="grid gap-2">
              <h5 className={`text-xl font-semibold `}>Social</h5>
              <div className="flex gap-4">
                <Link
                  to="https://www.linkedin.com/in/probir-sarkar"
                  target="_blank"
                >
                  <FaLinkedin className="text-2xl" />
                </Link>
                <Link to="https://wa.me/919511549471" target="_blank">
                  <FaWhatsappSquare className="text-2xl" />
                </Link>
                <Link to="https://github.com/probir-sarkar" target="_blank">
                  <FaGithubSquare className="text-2xl" />
                </Link>
                <Link to="https://blog.probirsarkar.com/" target="_blank">
                  <FaMedium className="text-2xl" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactSection;
