import ContactForm from './contact-form'
import { contactData } from '@/data'

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
              <p>{contactData.location}</p>
            </div>
            <div className="grid gap-2">
              <h5 className={`text-xl font-semibold `}>Talk to me</h5>
              <div className="grid">
                <a href={`tel:${contactData.phone}`}>{contactData.phone}</a>
                <a href={`mailto:${contactData.email}`}>{contactData.email}</a>
              </div>
            </div>
            <div className="grid gap-2">
              <h5 className={`text-xl font-semibold `}>Social</h5>
              <div className="flex gap-4">
                {contactData.socials.map(({ name, url, icon: Icon }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                  >
                    <Icon className="text-2xl" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default ContactSection
