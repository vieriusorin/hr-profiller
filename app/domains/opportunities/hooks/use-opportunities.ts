'use client';

import { useState, useEffect } from 'react';
import { Opportunity, OpportunityFilters } from '../../../shared/types';
import { OpportunityService } from '../services/opportunity-service';
import { opportunityApi } from '../../../shared/lib/api/mock-data';

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [onHoldOpportunities, setOnHoldOpportunities] = useState<Opportunity[]>([]);
  const [completedOpportunities, setCompletedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
        const [inProgress, onHold, completed] = await Promise.all([
          opportunityApi.getInProgressOpportunities(),
          opportunityApi.getOnHoldOpportunities(),
          opportunityApi.getCompletedOpportunities()
        ]);
        
        setOpportunities(inProgress);
        setOnHoldOpportunities(onHold);
        setCompletedOpportunities(completed);
      } catch (err) {
        setError('Failed to load opportunities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOpportunities();
  }, []);


  useEffect(() => {
    const moveCompletedOpportunities = () => {
      const completedFromInProgress = opportunities.filter(OpportunityService.checkOpportunityCompletion);
      if (completedFromInProgress.length > 0) {
        completedFromInProgress.forEach(opp => {
          const completedOpp = OpportunityService.changeOpportunityStatus(opp, 'Done');
          setCompletedOpportunities(prev => [...prev, completedOpp]);
          setOpportunities(prev => prev.filter(o => o.id !== opp.id));
        });
      }

      const completedFromOnHold = onHoldOpportunities.filter(OpportunityService.checkOpportunityCompletion);
      if (completedFromOnHold.length > 0) {
        completedFromOnHold.forEach(opp => {
          const completedOpp = OpportunityService.changeOpportunityStatus(opp, 'Done');
          setCompletedOpportunities(prev => [...prev, completedOpp]);
          setOnHoldOpportunities(prev => prev.filter(o => o.id !== opp.id));
        });
      }
    };

    moveCompletedOpportunities();
  }, [opportunities, onHoldOpportunities]);

  const addOpportunity = async (opportunity: Opportunity) => {
    try {
      const created = await opportunityApi.createOpportunity(opportunity);
      setOpportunities(prev => [...prev, created]);
      return created;
    } catch (err) {
      setError('Failed to create opportunity');
      throw err;
    }
  };

  const moveToOnHold = (opportunityId: number) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (opportunity) {
      const updatedOpportunity = OpportunityService.changeOpportunityStatus(opportunity, 'On Hold');
      setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
      setOnHoldOpportunities(prev => [...prev, updatedOpportunity]);
    }
  };

  const moveToInProgress = (opportunityId: number) => {
    const opportunity = onHoldOpportunities.find(opp => opp.id === opportunityId);
    if (opportunity) {
      const updatedOpportunity = OpportunityService.changeOpportunityStatus(opportunity, 'In Progress');
      setOnHoldOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
      setOpportunities(prev => [...prev, updatedOpportunity]);
    }
  };

  const updateOpportunityInList = (opportunityId: number, updatedOpportunity: Opportunity, list: 'inProgress' | 'onHold') => {
    if (list === 'inProgress') {
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunityId ? updatedOpportunity : opp
      ));
    } else {
      setOnHoldOpportunities(prev => prev.map(opp => 
        opp.id === opportunityId ? updatedOpportunity : opp
      ));
    }
  };

  const filterOpportunities = (opportunitiesList: Opportunity[], filters: OpportunityFilters): Opportunity[] => {
    return opportunitiesList.filter(opp => {
      const clientMatch = OpportunityService.filterByClient(opp, filters.client);
      const gradeMatch = !filters.grades || filters.grades.length === 0 || opp.roles.some(role => filters.grades.includes(role.requiredGrade));
      const hireMatch = OpportunityService.filterByHiringNeeds(opp, filters.needsHire);
      
      return clientMatch && gradeMatch && hireMatch;
    });
  };

  return {
    opportunities,
    onHoldOpportunities,
    completedOpportunities,
    loading,
    error,
    addOpportunity,
    moveToOnHold,
    moveToInProgress,
    updateOpportunityInList,
    filterOpportunities
  };
}; 