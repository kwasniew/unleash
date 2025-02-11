/**
 * Generated by Orval
 * Do not edit manually.
 * See `gen:api` script in package.json
 */

/**
 * User feedback information to be updated.
 */
export interface FeedbackUpdateSchema {
    /** The ID of the user that gave the feedback. */
    userId?: number;
    /** `true` if the user has asked never to see this feedback questionnaire again. */
    neverShow?: boolean;
    /** When this feedback was given */
    given?: string | null;
}
