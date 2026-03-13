-- Add reviews table for tracking review requests on expenses
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'resolved')),
  question TEXT NOT NULL,
  suggested_amount DECIMAL(12, 2),
  response TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_reviews_expense ON reviews(expense_id);
CREATE INDEX idx_reviews_requested_by ON reviews(requested_by);
CREATE INDEX idx_reviews_status ON reviews(status);

-- Update expenses table to reference current review (if any)
ALTER TABLE expenses ADD COLUMN current_review_id UUID REFERENCES reviews(id);
CREATE INDEX idx_expenses_current_review ON expenses(current_review_id);

-- Add trigger for auto-updated_at
CREATE TRIGGER reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
