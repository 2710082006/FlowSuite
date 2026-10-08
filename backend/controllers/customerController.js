const Customer = require("../models/Customer");
const WorkspaceMember = require("../models/WorkspaceMember");

// CREATE CUSTOMER
const createCustomer = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const {
      name,
      company,
      email,
      phone,
      address,
      industry,
      status,
      assignedTo,
      notes,
    } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "User is not associated with a workspace",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    // Validate assigned team member
    if (assignedTo) {
      const member = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: assignedTo,
        status: "active",
      });

      if (!member) {
        return res.status(400).json({
          success: false,
          message:
            "Assigned user is not an active member of this workspace",
        });
      }
    }

    const customer = await Customer.create({
      name: name.trim(),
      company: company?.trim() || "",
      email: email?.trim().toLowerCase() || "",
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      industry: industry?.trim() || "",
      status: status || "lead",
      assignedTo: assignedTo || null,
      notes: notes?.trim() || "",
      workspace: workspaceId,
      createdBy: req.user.id,
    });

    const populatedCustomer =
      await Customer.findById(customer._id)
        .populate(
          "assignedTo",
          "name email avatar"
        )
        .populate(
          "createdBy",
          "name email"
        );

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer: populatedCustomer,
    });
  } catch (error) {
    console.error(
      "Create customer error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};


// GET ALL CUSTOMERS
const getCustomers = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const {
      search = "",
      status,
      industry,
      assignedTo,
    } = req.query;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Workspace not found",
      });
    }

    const filter = {
      workspace: workspaceId,
    };

    // Search by name/company/email
    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { email: searchRegex },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (industry) {
      filter.industry = industry;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const customers = await Customer.find(filter)
      .populate(
        "assignedTo",
        "name email avatar"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error(
      "Get customers error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};


// GET CUSTOMER BY ID
const getCustomerById = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const customer =
      await Customer.findOne({
        _id: req.params.id,
        workspace: workspaceId,
      })
        .populate(
          "assignedTo",
          "name email avatar"
        )
        .populate(
          "createdBy",
          "name email"
        );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error(
      "Get customer error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};


// UPDATE CUSTOMER
const updateCustomer = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const customer =
      await Customer.findOne({
        _id: req.params.id,
        workspace: workspaceId,
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const {
      name,
      company,
      email,
      phone,
      address,
      industry,
      status,
      assignedTo,
      notes,
    } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Customer name is required",
        });
      }

      customer.name = name.trim();
    }

    if (company !== undefined) {
      customer.company = company.trim();
    }

    if (email !== undefined) {
      customer.email =
        email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      customer.phone = phone.trim();
    }

    if (address !== undefined) {
      customer.address = address.trim();
    }

    if (industry !== undefined) {
      customer.industry = industry.trim();
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "lead",
        "active",
        "inactive",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer status",
        });
      }

      customer.status = status;
    }

    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === "") {
        customer.assignedTo = null;
      } else {
        const member =
          await WorkspaceMember.findOne({
            workspace: workspaceId,
            user: assignedTo,
            status: "active",
          });

        if (!member) {
          return res.status(400).json({
            success: false,
            message:
              "Assigned user is not an active member of this workspace",
          });
        }

        customer.assignedTo = assignedTo;
      }
    }

    if (notes !== undefined) {
      customer.notes = notes.trim();
    }

    await customer.save();

    const updatedCustomer =
      await Customer.findById(customer._id)
        .populate(
          "assignedTo",
          "name email avatar"
        )
        .populate(
          "createdBy",
          "name email"
        );

    res.json({
      success: true,
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    console.error(
      "Update customer error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};


// DELETE CUSTOMER
const deleteCustomer = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const customer =
      await Customer.findOne({
        _id: req.params.id,
        workspace: workspaceId,
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await Customer.deleteOne({
      _id: customer._id,
       workspace: workspaceId,
    });

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete customer error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
};


module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};