
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OrderWithItems, DeliveryPartner } from '../types';

export const useOwnerDashboard = () => {
  const { user, userRole, checkUserRole, isOwner } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);

  // Setup authentication and access check
  useEffect(() => {
    const checkAccess = async () => {
      try {
        console.log("Checking access - User:", user?.email, "isOwner:", isOwner);
        
        if (!user) {
          console.log("No user found, redirecting to auth");
          toast({
            title: "Authentication Required",
            description: "Please log in to access this page",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }
        
        let roleCheckAttempts = 0;
        const maxAttempts = 3;
        let hasOwnerRole = isOwner;
        
        while (!hasOwnerRole && roleCheckAttempts < maxAttempts) {
          console.log(`Checking owner role, attempt ${roleCheckAttempts + 1}`);
          roleCheckAttempts++;
          
          try {
            const role = await checkUserRole();
            console.log("Role check returned:", role);
            hasOwnerRole = role === 'owner';
            
            if (hasOwnerRole) {
              console.log("Owner role confirmed");
              break;
            }
            
            if (roleCheckAttempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          } catch (roleError) {
            console.error("Error in role check:", roleError);
          }
        }
        
        if (!hasOwnerRole) {
          console.log("Access denied after max attempts, redirecting");
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
        
        fetchOrders();
        fetchDeliveryPartners();
      } catch (error) {
        console.error("Error in access check:", error);
        toast({
          title: "Error",
          description: "An error occurred while checking permissions",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkAccess();
  }, [user, isOwner, navigate]);

  const fetchDeliveryPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_partners_emails')
        .select('*');
      
      if (error) {
        console.error("Error fetching delivery partners:", error);
        return;
      }
      
      const formattedPartners: DeliveryPartner[] = data.map((item: any) => ({
        id: item.id,
        partner_name: item.partner_name || `Partner ${item.id.substring(0, 4)}`,
        phone_number: item.phone_number || '(Phone not available)',
        email: item.email,
        status: 'Available' as const
      }));
      
      console.log("Fetched delivery partners:", formattedPartners);
      setPartners(formattedPartners);
    } catch (error) {
      console.error("Unexpected error fetching delivery partners:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (ordersError) throw ordersError;
      
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
            
          if (itemsError) throw itemsError;
          
          return {
            ...order,
            items: orderItems || []
          };
        })
      );
      
      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    }
  };

  const handleRoleAssigned = () => {
    fetchDeliveryPartners();
    
    toast({
      title: "Role Updated",
      description: "Delivery partner role has been assigned. User can now log in as a delivery partner.",
    });
  };

  const assignOwnerRole = async (email: string) => {
    try {
      const { error } = await supabase
        .rpc('assign_role', { 
          user_email: email, 
          assigned_role: 'owner' 
        });

      if (error) {
        console.error("Error assigning owner role:", error);
        return;
      }

      console.log("Owner role assigned successfully to:", email);
      
      if (user) {
        const updatedRole = await checkUserRole();
        console.log("Updated role:", updatedRole);
      }
    } catch (error) {
      console.error("Unexpected error assigning owner role:", error);
    }
  };

  // Owner email auto-assignment effect
  useEffect(() => {
    if (user?.email === 'aryaprasad771@gmail.com') {
      assignOwnerRole('aryaprasad771@gmail.com');
    }
  }, [user]);

  return {
    loading,
    orders,
    setOrders,
    partners,
    setPartners,
    handleRoleAssigned,
  };
};
