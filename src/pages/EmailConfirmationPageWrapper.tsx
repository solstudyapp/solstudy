import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import EmailConfirmationPage from "./EmailConfirmationPage"

const EmailConfirmationPageWrapper = () => {
  const { emailForConfirmation, setEmailForConfirmation } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If there's no email for confirmation, redirect to auth page
    if (!emailForConfirmation) {
      navigate("/auth")
    }

    // Clean up the email when component unmounts
    return () => {
      setEmailForConfirmation(null)
    }
  }, [emailForConfirmation, navigate, setEmailForConfirmation])

  if (!emailForConfirmation) {
    return null
  }

  return <EmailConfirmationPage email={emailForConfirmation} />
}

export default EmailConfirmationPageWrapper
