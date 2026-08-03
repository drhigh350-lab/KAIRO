/**
 * Kairo — KaiBehavior
 * The behavioral framework for Kai, the AI study companion.
 * 
 * Kai is not a chatbot. Kai is a senior student who notices specific things,
 * gives earned encouragement, and explains the system when relevant.
 */

import { MacroState, ErrorTag, KaiRules } from "../utils/constants.js";

export class KaiBehavior {
  constructor(studentProfile) {
    this.profile = studentProfile;
    this.wisdomSparkCooldown = 0; // prevent over-firing
  }

  /**
   * Generate a response after a student answer.
   * @param {Object} context
   *   - result: { correct, errorTag, conceptName, responseTimeMs }
   *   - conceptState: string (retention state)
   *   - macroState: string
   *   - isMilestone: boolean (e.g., Reinforced transition)
   */
  respondToAnswer(context) {
    const { result, conceptState, macroState, isMilestone } = context;

    // Milestone: Reinforced transition → Wisdom Spark
    if (isMilestone && conceptState === 'reinforced') {
      return {
        type: 'milestone',
        text: this._milestoneMessage(context),
        tone: 'earned_pride',
        triggerWisdomSpark: true,
        specific: true
      };
    }

    // Error-based responses
    if (!result.correct) {
      return this._errorResponse(result.errorTag, context);
    }

    // Correct answer responses (varied by state)
    return this._correctResponse(conceptState, macroState, context);
  }

  _errorResponse(errorTag, context) {
    const { conceptName } = context;
    const responses = {
      [ErrorTag.CONCEPTUAL_GAP]: {
        text: `Not quite — let's look at "${conceptName}" from a different angle. The first explanation didn't land, so here's another way to think about it.`,
        action: 're_explain_alternate',
        tone: 'patient_reframe',
        followUp: 'scaffolded_question'
      },
      [ErrorTag.CARELESS_SLIP]: {
        text: `Your approach to "${conceptName}" was right — small slip in the execution. It happens under pressure.`,
        action: 'brief_nudge',
        tone: 'light_touch',
        followUp: 'similar_question'
      },
      [ErrorTag.MISAPPLIED_RULE]: {
        text: `This looks like a rule mix-up on "${conceptName}". Let's draw the line clearly between the two concepts so they stop colliding.`,
        action: 'compare_contrast',
        tone: 'clarifying',
        followUp: 'distinguishing_question'
      },
      [ErrorTag.PARTIAL_UNDERSTANDING]: {
        text: `You're almost there on "${conceptName}" — the setup was solid. Let's isolate exactly which step broke down.`,
        action: 'isolate_step',
        tone: 'almost_there',
        followUp: 'step_focused_question'
      },
      [ErrorTag.GUESSED]: {
        text: `Let's find your actual starting point on "${conceptName}" — no judgment, just want to place you accurately.`,
        action: 'diagnostic',
        tone: 'neutral_placement',
        followUp: 'lower_stakes_diagnostic'
      },
      [ErrorTag.MISREAD_QUESTION]: {
        text: `Take a closer look at what the question is actually asking on "${conceptName}" — this is a reading signal, not a knowledge gap.`,
        action: 'comprehension_flag',
        tone: 'neutral_direct',
        followUp: 're_read_question'
      }
    };

    return responses[errorTag] || responses[ErrorTag.CONCEPTUAL_GAP];
  }

  _correctResponse(state, macroState, context) {
    const { conceptName } = context;

    // Vary by macro-state
    if (macroState === MacroState.ORIENTING) {
      return {
        text: `Good — "${conceptName}" is registering. I'm still getting a feel for where you're strong. Keep going.`,
        tone: 'orienting_warm',
        specific: true
      };
    }

    if (macroState === MacroState.COMPOUNDING || macroState === MacroState.PEAK_READINESS) {
      return {
        text: `Solid on "${conceptName}". You're ready for the next level — I've got something harder queued.`,
        tone: 'earned_challenge',
        specific: true
      };
    }

    if (macroState === MacroState.WAVERING) {
      return {
        text: `That was clean on "${conceptName}". Small wins matter right now.`,
        tone: 'gentle_acknowledgment',
        specific: true
      };
    }

    // Default (Building, Recovering)
    const specifics = [
      `Clean recall on "${conceptName}" — that's sticking.`,
      `"${conceptName}" handled well. The pattern is building.`,
      `Correct on "${conceptName}". Let's keep the momentum.`
    ];
    return {
      text: specifics[Math.floor(Math.random() * specifics.length)],
      tone: 'steady_specific',
      specific: true
    };
  }

  _milestoneMessage(context) {
    const { conceptName } = context;
    return {
      text: `"${conceptName}" — you remembered this after time had passed. That's not luck. That's learning.`,
      tone: 'earned_celebration',
      triggerWisdomSpark: true
    };
  }

  /**
   * Proactive messages (Kai initiates, not just reacts).
   */
  proactiveMessage(type, data = {}) {
    switch (type) {
      case 'reinforced_transition':
        return {
          text: `You've now recalled "${data.conceptName}" twice without help — that's sticking.`,
          tone: 'pattern_notice',
          triggerWisdomSpark: true
        };
      case 'session_pattern':
        return {
          text: `Your last three strong sessions all followed a short break first — interesting pattern.`,
          tone: 'insightful_observation'
        };
      case 'prerequisite_reroute':
        return {
          text: `I noticed "${data.prereqName}" keeps tripping this up, so I brought that back in first.`,
          tone: 'system_transparent'
        };
      case 'session_open':
        return this._sessionOpenMessage();
      case 'recovery_welcome':
        return {
          text: `We're starting light today, on purpose. No need to make up for lost time — just move forward.`,
          tone: 'permission_giving'
        };
      default:
        return null;
    }
  }

  _sessionOpenMessage() {
    const macro = this.profile.macroState;
    const messages = {
      [MacroState.ORIENTING]: `Let's figure out where you stand. I'm mixing a few things just to get a feel for your strengths.`,
      [MacroState.BUILDING]: `Ready to build. I've queued what matters most for you right now.`,
      [MacroState.COMPOUNDING]: `You're in a strong rhythm. Today we stretch the ceiling a little.`,
      [MacroState.WAVERING]: `Let's keep it steady today. I've picked questions that rebuild confidence.`,
      [MacroState.RECOVERING]: `Welcome back. We're starting light — on purpose.`,
      [MacroState.PEAK_READINESS]: `Game day is close. Let's sharpen execution, not learn new theory.`
    };
    return {
      text: messages[macro] || messages[MacroState.BUILDING],
      tone: 'session_open'
    };
  }

  /**
   * Weekly reflection generator.
   */
  generateWeeklyReflection(weekData) {
    const { reinforced, fading, patternObservation } = weekData;
    const parts = [];

    if (reinforced.length > 0) {
      const names = reinforced.slice(0, 3).map(c => c.name).join(', ');
      parts.push(`This week, ${reinforced.length} concept${reinforced.length > 1 ? 's' : ''} moved from Fading to Reinforced — including ${names}. That's the hardest thing to fake.`);
    }

    if (fading.length > 0) {
      parts.push(`${fading.length} concept${fading.length > 1 ? 's' : ''} will come back around soon — not a warning, just a heads-up.`);
    }

    if (patternObservation) {
      parts.push(patternObservation);
    }

    return {
      text: parts.join('\n\n'),
      tone: 'reflective_private',
      shareable: false
    };
  }

  /**
   * Check if Wisdom Spark should fire.
   * Reserved for genuine inflection points.
   */
  shouldTriggerWisdomSpark(eventType) {
    const validEvents = ['reinforced_transition', 'macro_state_upgrade', 'milestone_recall'];
    if (!validEvents.includes(eventType)) return false;
    // Cooldown: max once per 3 events to preserve rarity
    this.wisdomSparkCooldown++;
    if (this.wisdomSparkCooldown >= 3) {
      this.wisdomSparkCooldown = 0;
      return true;
    }
    return false;
  }
}
