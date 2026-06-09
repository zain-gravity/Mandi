import mongoose from 'mongoose';

// Since we didn't define a specific ApprovalRequest schema initially, 
// we'll manage approval state directly on the entities themselves (MasterItem, Trade, Peshgi)
// as per the models we created.

/**
 * Maker-Checker Engine
 */
export class ApprovalEngine {
  
  /**
   * Approves a pending entity
   * Uses transaction to ensure atomic operations if needed
   */
  static async approveEntity(
    companyId: string, 
    modelName: string, 
    entityId: string, 
    checkerId: string, 
    editedData?: any,
    remarks?: string
  ) {
    const Model = mongoose.model(modelName);
    
    // Start session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find the entity ensuring it belongs to the company and is waiting for approval
      const entity = await Model.findOne({
        _id: entityId,
        companyId,
        $or: [
          { status: 'WAITING_FOR_APPROVAL' }, 
          { approvalStatus: 'WAITING_FOR_APPROVAL' }
        ]
      }).session(session);

      if (!entity) {
        throw new Error('Entity not found or not in WAITING_FOR_APPROVAL state');
      }

      // CRITICAL: Checker !== Maker enforcement
      const makerId = entity.proposedBy || entity.createdBy;
      if (makerId && makerId.toString() === checkerId) {
        throw new Error('Maker and Checker cannot be the same user');
      }

      // Apply any edits made by checker before approving
      if (editedData) {
        Object.assign(entity, editedData);
      }

      // Update status
      if (entity.status !== undefined) {
        entity.status = 'APPROVED';
      }
      if (entity.approvalStatus !== undefined) {
        entity.approvalStatus = 'APPROVED';
      }

      entity.approvedBy = checkerId;
      entity.reviewedBy = checkerId; // For MasterItem
      entity.approvedAt = new Date();
      entity.reviewedAt = new Date(); // For MasterItem
      if (remarks) {
        entity.reviewNote = remarks;
      }

      await entity.save({ session });
      
      await session.commitTransaction();
      return entity;
      
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async denyEntity(
    companyId: string, 
    modelName: string, 
    entityId: string, 
    checkerId: string, 
    remarks: string
  ) {
    if (!remarks) throw new Error('Remarks are required when denying an approval');
    
    const Model = mongoose.model(modelName);
    
    const entity = await Model.findOne({
      _id: entityId,
      companyId,
      $or: [
        { status: 'WAITING_FOR_APPROVAL' }, 
        { approvalStatus: 'WAITING_FOR_APPROVAL' }
      ]
    });

    if (!entity) {
      throw new Error('Entity not found or not in WAITING_FOR_APPROVAL state');
    }

    const makerId = entity.proposedBy || entity.createdBy;
    if (makerId && makerId.toString() === checkerId) {
      throw new Error('Maker and Checker cannot be the same user');
    }

    if (entity.status !== undefined) entity.status = 'DENIED';
    if (entity.approvalStatus !== undefined) entity.approvalStatus = 'DENIED';
    
    entity.reviewedBy = checkerId;
    entity.approvedBy = checkerId;
    entity.reviewNote = remarks;
    entity.reviewedAt = new Date();

    await entity.save();
    return entity;
  }
}
