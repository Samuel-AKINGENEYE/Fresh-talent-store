'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, ThumbsUp, User, Calendar, CheckCircle } from 'lucide-react';

interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  user_id: string;
  created_at: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  user?: {
    full_name: string;
  };
}

interface ProductReviewsProps {
  productId: number;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userHelpfulVotes, setUserHelpfulVotes] = useState<Set<number>>(new Set());
  
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  useEffect(() => {
    loadReviews();
    checkUserAndPurchase();
    loadUserHelpfulVotes();
  }, [productId]);

  const loadReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(full_name)
      `)
      .eq('product_id', productId)
      .order('helpful_count', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (data) {
      setReviews(data);
      
      const total = data.length;
      const sum = data.reduce((acc, r) => acc + r.rating, 0);
      setAverageRating(total > 0 ? sum / total : 0);
      
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach(r => counts[r.rating as keyof typeof counts]++);
      setRatingCounts(counts);
    }
    setLoading(false);
  };

  const checkUserAndPurchase = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      const { data: orders } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('product_id', productId);
      
      if (orders && orders.length > 0) {
        setHasPurchased(true);
      }
    }
  };

  const loadUserHelpfulVotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: votes } = await supabase
      .from('review_helpful_votes')
      .select('review_id')
      .eq('user_id', user.id);
    
    if (votes) {
      setUserHelpfulVotes(new Set(votes.map(v => v.review_id)));
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to leave a review');
      return;
    }
    
    setSubmitting(true);
    
    const { error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: user.id,
        rating,
        title,
        comment,
        is_verified_purchase: hasPurchased,
      });
    
    if (error) {
      alert('Error submitting review: ' + error.message);
    } else {
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);
      
      const newAvg = allReviews ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length : rating;
      const newCount = allReviews ? allReviews.length : 1;
      
      await supabase
        .from('products')
        .update({ avg_rating: newAvg, review_count: newCount })
        .eq('id', productId);
      
      alert('Review submitted successfully!');
      setShowForm(false);
      setTitle('');
      setComment('');
      setRating(5);
      loadReviews();
    }
    setSubmitting(false);
  };

  const handleHelpful = async (reviewId: number) => {
    if (!user) {
      alert('Please login to mark as helpful');
      return;
    }
    
    // Check if user already voted
    if (userHelpfulVotes.has(reviewId)) {
      alert('You have already marked this review as helpful');
      return;
    }
    
    const { error } = await supabase
      .from('review_helpful_votes')
      .insert({ review_id: reviewId, user_id: user.id });
    
    if (!error) {
      setUserHelpfulVotes(prev => new Set([...prev, reviewId]));
      
      // Update helpful count
      const currentReview = reviews.find(r => r.id === reviewId);
      if (currentReview) {
        await supabase
          .from('reviews')
          .update({ helpful_count: currentReview.helpful_count + 1 })
          .eq('id', reviewId);
        loadReviews();
      }
    } else if (error.code === '23505') {
      alert('You have already marked this review as helpful');
    } else {
      alert('Error marking as helpful: ' + error.message);
    }
  };

  const renderStars = (rating: number, size: number = 4) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-${size} w-${size} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
      
      {/* Review Summary */}
      <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b">
        <div className="text-center">
          <div className="text-5xl font-bold text-blue-600">{averageRating.toFixed(1)}</div>
          <div className="flex justify-center my-2">{renderStars(Math.round(averageRating), 5)}</div>
          <div className="text-sm text-gray-500">{reviews.length} reviews</div>
        </div>
        
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm w-8">{star} ★</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${(ratingCounts[star as keyof typeof ratingCounts] / (reviews.length || 1)) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-12">{ratingCounts[star as keyof typeof ratingCounts]}</span>
            </div>
          ))}
        </div>
        
        {hasPurchased && !reviews.some(r => r.user_id === user?.id) && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
          >
            Write a Review
          </button>
        )}
      </div>
      
      {/* Write Review Form */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">Write your review for {productName}</h4>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Review Title</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Review</label>
            <textarea
              required
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      
      {/* Sort Options */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">All Reviews</h4>
        <select className="text-sm border rounded-lg px-2 py-1">
          <option value="helpful">Most Helpful</option>
          <option value="newest">Newest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>
      
      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-6 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  {renderStars(review.rating)}
                  <h4 className="font-semibold mt-1">{review.title}</h4>
                </div>
                {review.is_verified_purchase && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified Purchase
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 mb-3">{review.comment}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{review.user?.full_name || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleHelpful(review.id)}
                  disabled={userHelpfulVotes.has(review.id)}
                  className={`flex items-center gap-1 transition ${
                    userHelpfulVotes.has(review.id)
                      ? 'text-green-600 cursor-default'
                      : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${userHelpfulVotes.has(review.id) ? 'fill-green-600' : ''}`} />
                  <span>{review.helpful_count} {review.helpful_count === 1 ? 'person found this helpful' : 'people found this helpful'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
