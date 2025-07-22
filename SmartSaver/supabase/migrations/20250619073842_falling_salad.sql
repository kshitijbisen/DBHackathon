/*
  # Create subscriptions table for Stripe integration

  1. New Tables
    - `subscriptions`
      - `id` (text, primary key) - Stripe subscription ID
      - `user_id` (uuid, foreign key) - References auth.users
      - `status` (text) - Subscription status (active, canceled, etc.)
      - `plan_name` (text) - Name of the subscription plan
      - `current_period_start` (timestamptz) - Current billing period start
      - `current_period_end` (timestamptz) - Current billing period end
      - `cancel_at_period_end` (boolean) - Whether subscription cancels at period end
      - `created_at` (timestamptz) - When subscription was created
      - `updated_at` (timestamptz) - When subscription was last updated

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policy for users to read their own subscription data
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  plan_name text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_subscriptions_updated_at
      BEFORE UPDATE ON subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;