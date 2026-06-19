import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Demo from '../components/Demo';
import DashboardPreview from '../components/DashboardPreview';
import WhyChoose from '../components/WhyChoose';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import CTAFinal from '../components/CTAFinal';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />
      <Hero />
      <Features />
      <Demo />
      <DashboardPreview />
      <WhyChoose />
      <Pricing />
      <FAQ />
      <CTAFinal />
      <Footer />
    </div>
  );
}