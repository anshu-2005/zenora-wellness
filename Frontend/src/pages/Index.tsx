
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import FloatingBackground from '@/components/FloatingBackground'
import { useAuthStore } from '@/lib/store'

const Index = () => {
  const { isAuthenticated } = useAuthStore()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.3,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const features = [
    {
      title: "Mental Health Assessment",
      description: "Take our clinically validated assessments to understand your mental wellbeing.",
      color: "bg-zenora-lavender"
    },
    {
      title: "Daily Mood Tracking",
      description: "Track your emotional patterns with our simple mood tracker.",
      color: "bg-zenora-mint"
    },
    {
      title: "Reflective Journaling",
      description: "Express yourself freely in a private, judgment-free space.",
      color: "bg-zenora-skyblue"
    },
    {
      title: "Supportive AI Companion",
      description: "Chat with our compassionate AI to receive guidance and support.",
      color: "bg-zenora-peach"
    }
  ]

  return (
    <div className="min-h-screen pt-24 pb-12">
      <FloatingBackground />
      
      {/* Hero Section */}
      <motion.section 
        className="zenora-container py-16 md:py-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Start Your Journey to <span className="text-primary">Mental Wellbeing</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            ZENORA provides a safe space for self-reflection, growth, and healing through clinically-informed tools and compassionate support.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
              <Button className="zenora-button-primary w-full sm:w-auto">
                {isAuthenticated ? "Go to Dashboard" : "Start Your Journey"}
              </Button>
            </Link>
            
            <Link to="/assessment">
              <Button className="zenora-button-outline w-full sm:w-auto">
                Take Assessment
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Features Section */}
      <motion.section 
        className="zenora-container py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
      >
        <motion.h2 variants={itemVariants} className="text-3xl font-bold text-center mb-12">
          Tools for Your Wellbeing
        </motion.h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="zenora-card relative overflow-hidden border border-border"
            >
              <div className={`absolute top-0 left-0 w-2 h-full ${feature.color}`}></div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
      
      {/* CTA Section */}
      <motion.section 
        className="zenora-container py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        viewport={{ once: true }}
      >
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden zenora-gradients rounded-3xl p-8 md:p-12"
        >
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Begin Your Healing Path Today</h2>
            <p className="text-lg mb-6 opacity-90">Your mental wellbeing matters. Take the first step toward a more peaceful mind.</p>
            <Link to="/signup">
              <Button className="zenora-button-primary">Create Free Account</Button>
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </div>
  )
}

export default Index
