import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="bg-orange-50">
      <p className="max-w-6xl p-3 py-7 text-slate-700 text-center text-sm mx-auto">
        Brought to you with ♥️ by{" "}
        <Link
          className="font-semibold hover:underline"
          to="https://www.linkedin.com/in/juvenstu/"
        >
          Juvens Tuyizere
        </Link>
        . Explore additional open-source projects on{" "}
        <Link
          className="font-semibold text-blue-500 hover:underline"
          to="https://github.com/juvenstu"
        >
          GitHub
        </Link>
      </p>
    </div>
  );
}
