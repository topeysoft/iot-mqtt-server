[
    {
        "$unwind": "widget_ids"
    },
    {
        "$lookup": {
            "from": "widgets",
            "localField": "widget_ids",
            "foreignField": "_id",
            "as": "widgets"
        }
    }
]