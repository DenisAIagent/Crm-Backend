import { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-hot-toast'

/**
 * Hook avancé pour la gestion des formulaires avec validation, sécurité et UX
 */
export function useFormManager(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)
  const [isDirty, setIsDirty] = useState(false)

  // Protection anti-brute force
  const [attemptCount, setAttemptCount] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockUntil, setBlockUntil] = useState(null)

  // Vérifier si l'utilisateur est bloqué
  useEffect(() => {
    if (blockUntil && Date.now() < blockUntil) {
      setIsBlocked(true)
      const timeLeft = Math.ceil((blockUntil - Date.now()) / 1000)
      toast.error(`Trop de tentatives. Veuillez patienter ${timeLeft} secondes.`)

      const timer = setTimeout(() => {
        setIsBlocked(false)
        setBlockUntil(null)
        setAttemptCount(0)
      }, blockUntil - Date.now())

      return () => clearTimeout(timer)
    }
  }, [blockUntil])

  /**
   * Validation d'un champ spécifique
   */
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name]
    if (!rules) return ''

    // Validation required
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rules.required.message || `${name} est requis`
    }

    // Validation pattern (regex)
    if (rules.pattern && value && !rules.pattern.value.test(value)) {
      return rules.pattern.message || `Format ${name} invalide`
    }

    // Validation minLength
    if (rules.minLength && value && value.length < rules.minLength.value) {
      return rules.minLength.message || `${name} doit contenir au moins ${rules.minLength.value} caractères`
    }

    // Validation maxLength
    if (rules.maxLength && value && value.length > rules.maxLength.value) {
      return rules.maxLength.message || `${name} ne peut dépasser ${rules.maxLength.value} caractères`
    }

    // Validation custom
    if (rules.validate && value) {
      const result = rules.validate(value, values)
      if (result !== true) {
        return result
      }
    }

    return ''
  }, [validationRules, values])

  /**
   * Valider tous les champs
   */
  const validateForm = useCallback(() => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validateField, validationRules])

  /**
   * Gérer les changements de valeur
   */
  const handleChange = useCallback((name, value) => {
    setValues(prev => {
      const newValues = { ...prev, [name]: value }
      setIsDirty(JSON.stringify(newValues) !== JSON.stringify(initialValues))
      return newValues
    })

    // Validation en temps réel si le champ a été touché
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }, [touched, validateField, initialValues])

  /**
   * Marquer un champ comme touché
   */
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))

    // Valider le champ au blur
    const error = validateField(name, values[name])
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [values, validateField])

  /**
   * Gérer la soumission avec protection anti-brute force
   */
  const handleSubmit = useCallback(async (onSubmit, options = {}) => {
    // Vérifier si bloqué
    if (isBlocked) {
      toast.error('Trop de tentatives. Veuillez patienter.')
      return { success: false, error: 'Blocked' }
    }

    // Prévenir les soumissions multiples
    if (isSubmitting) {
      return { success: false, error: 'Already submitting' }
    }

    setIsSubmitting(true)
    setSubmitCount(prev => prev + 1)

    // Marquer tous les champs comme touchés
    const allFields = Object.keys(validationRules)
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}))

    // Validation complète
    if (!validateForm()) {
      setIsSubmitting(false)
      toast.error('Veuillez corriger les erreurs du formulaire')
      return { success: false, error: 'Validation failed' }
    }

    try {
      // Sécurité: nettoyer les données avant envoi
      const sanitizedValues = sanitizeFormData(values)

      // Ajouter des métadonnées de sécurité
      const submissionData = {
        ...sanitizedValues,
        _timestamp: Date.now(),
        _userAgent: navigator.userAgent,
        _submitCount: submitCount + 1
      }

      const result = await onSubmit(submissionData)

      if (result && result.success) {
        // Reset form si demandé
        if (options.resetOnSuccess) {
          setValues(initialValues)
          setTouched({})
          setErrors({})
          setIsDirty(false)
        }

        // Reset attempt count en cas de succès
        setAttemptCount(0)

        return result
      } else {
        throw new Error(result?.error || 'Erreur de soumission')
      }

    } catch (error) {
      console.error('Form submission error:', error)

      // Gestion anti-brute force
      const newAttemptCount = attemptCount + 1
      setAttemptCount(newAttemptCount)

      if (newAttemptCount >= 5) {
        const blockDuration = Math.min(Math.pow(2, newAttemptCount - 5) * 30000, 300000) // Max 5 minutes
        setBlockUntil(Date.now() + blockDuration)
        toast.error(`Trop de tentatives. Compte bloqué temporairement.`)
      }

      return { success: false, error: error.message }
    } finally {
      setIsSubmitting(false)
    }
  }, [
    isBlocked,
    isSubmitting,
    validationRules,
    validateForm,
    values,
    submitCount,
    attemptCount,
    initialValues
  ])

  /**
   * Reset du formulaire
   */
  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
    setIsDirty(false)
    setSubmitCount(0)
  }, [initialValues])

  /**
   * Vérifier si le formulaire est valide
   */
  const isValid = Object.keys(errors).length === 0 && Object.keys(touched).length > 0

  return {
    // État
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    isBlocked,
    submitCount,

    // Actions
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validateForm,
    validateField,

    // Utilitaires
    setValue: (name, value) => setValues(prev => ({ ...prev, [name]: value })),
    setError: (name, error) => setErrors(prev => ({ ...prev, [name]: error })),
    clearErrors: () => setErrors({}),
    getFieldProps: (name) => ({
      name,
      value: values[name] || '',
      onChange: (e) => handleChange(name, e.target.value),
      onBlur: () => handleBlur(name),
      error: touched[name] ? errors[name] : ''
    })
  }
}

/**
 * Nettoyer les données du formulaire pour la sécurité
 */
function sanitizeFormData(data) {
  const sanitized = {}

  Object.keys(data).forEach(key => {
    const value = data[key]

    if (typeof value === 'string') {
      // Trimmer les espaces
      sanitized[key] = value.trim()

      // Encoder les caractères HTML pour éviter XSS
      sanitized[key] = sanitized[key]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
    } else {
      sanitized[key] = value
    }
  })

  return sanitized
}

/**
 * Règles de validation communes
 */
export const commonValidationRules = {
  email: {
    required: { message: 'L\'email est requis' },
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Format d\'email invalide'
    }
  },

  password: {
    required: { message: 'Le mot de passe est requis' },
    minLength: {
      value: 6,
      message: 'Le mot de passe doit contenir au moins 6 caractères'
    },
    validate: (value) => {
      if (!/(?=.*[a-z])/.test(value)) {
        return 'Le mot de passe doit contenir au moins une minuscule'
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        return 'Le mot de passe doit contenir au moins une majuscule'
      }
      if (!/(?=.*\d)/.test(value)) {
        return 'Le mot de passe doit contenir au moins un chiffre'
      }
      return true
    }
  },

  strongPassword: {
    required: { message: 'Le mot de passe est requis' },
    minLength: {
      value: 8,
      message: 'Le mot de passe doit contenir au moins 8 caractères'
    },
    validate: (value) => {
      if (!/(?=.*[a-z])/.test(value)) {
        return 'Le mot de passe doit contenir au moins une minuscule'
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        return 'Le mot de passe doit contenir au moins une majuscule'
      }
      if (!/(?=.*\d)/.test(value)) {
        return 'Le mot de passe doit contenir au moins un chiffre'
      }
      if (!/(?=.*[@$!%*?&])/.test(value)) {
        return 'Le mot de passe doit contenir au moins un caractère spécial'
      }
      return true
    }
  },

  name: {
    required: { message: 'Le nom est requis' },
    minLength: {
      value: 2,
      message: 'Le nom doit contenir au moins 2 caractères'
    },
    maxLength: {
      value: 50,
      message: 'Le nom ne peut dépasser 50 caractères'
    }
  }
}

export default useFormManager