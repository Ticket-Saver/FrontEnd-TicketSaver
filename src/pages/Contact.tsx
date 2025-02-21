export default function Contact() {
  return (
    <>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg mb-4">
          Have a question, need assistance, or just want to say hello? We're here to help! Feel free
          to reach out to us using the following methods:
        </p>
        <h1 className="text-xl font-bold mb-4">Customer Support: </h1>
        <div className="pl-5">
          <div className="flex space-x-1">
            <p className="text-lg mb-4">Email:</p>
            <a
              href="mailto:support@ticketsaver.net"
              className="text-blue-500 hover:underline text-xl"
            >
              support@ticketsaver.net
            </a>
          </div>
          <div className="flex space-x-1">
            <p className="text-lg mb-4">Phone:</p>
            <a href="tel:+1-956-445-9793" className="text-blue-500 hover:underline text-xl">
              +1-956-445-9793
            </a>
            <p className="text-lg mb-4">
              (You can text this number with your concern and email. We can get back to you faster)
            </p>
          </div>
        </div>
        <h1 className="text-xl font-bold mb-4">Event Organizers: </h1>

        <div className="pl-5">
          <div className="flex space-x-1">
            <p className="text-lg mb-4">Email:</p>
            <a
              href="mailto:ticketing@ticketsaver.net"
              className="text-blue-500 hover:underline text-xl"
            >
              ticketing@ticketsaver.net
            </a>
          </div>
          <div className="flex space-x-1">
            <p className="text-lg mb-4">Phone:</p>
            <a href="tel:+1-956-445-9793" className="text-blue-500 hover:underline text-xl">
              +1-956-445-9793
            </a>
          </div>
        </div>
        <h1 className="text-xl font-bold mb-4">Corporate Office:</h1>

        <div className="pl-5">
          <p className="text-lg mb-4">
            Ticket Saver LLC <br />
            7500 W IH 2 <br />
            Mission, TX 78572
          </p>
        </div>

        <h1 className="text-xl font-bold mb-4">Corporate Office:</h1>
        <p className="text-lg mb-4">
          Follow us on social media for the latest updates, promotions, and more:
        </p>
        <div className="pl-5">
          <div className="flex space-x-1">
            <p className="text-lg mb-4">• Facebook:</p>
            <a href="" className="text-blue-500 hover:underline text-xl">
              @Ticket.Saver
            </a>
          </div>
          <div className="flex space-x-1">
            <p className="text-lg mb-4">• Twitter:</p>
            <a href="" className="text-blue-500 hover:underline text-xl">
              @Ticket.Saver
            </a>
          </div>
          <div className="flex space-x-1">
            <p className="text-lg mb-4">• Instagram:</p>
            <a href="" className="text-blue-500 hover:underline text-xl">
              @Ticket.Saver
            </a>
          </div>
        </div>
        <p className="text-lg mb-4">
          We look forward to hearing from you and assisting you with your ticketing needs!
        </p>
      </div>
    </>
  )
}
