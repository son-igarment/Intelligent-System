from datetime import datetime

def create_item_model(name, description=None, price=None):
    """
    Create a new item document for MongoDB
    """
    return {
        "name": name,
        "description": description,
        "price": price,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

def validate_item(item_data):
    """
    Validate item data before saving to MongoDB
    """
    errors = []
    
    if not item_data.get("name"):
        errors.append("Name is required")
    
    if "price" in item_data and item_data["price"] is not None:
        try:
            price = float(item_data["price"])
            if price < 0:
                errors.append("Price cannot be negative")
        except ValueError:
            errors.append("Price must be a number")
    
    return len(errors) == 0, errors 