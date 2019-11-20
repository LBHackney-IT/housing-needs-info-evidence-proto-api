WITH offers_cte AS (
	SELECT DISTINCT
		app_ref,
		prop_ref
	FROM
		wloffers
	WHERE
		wloffers.offer_date > DateAdd (yy,
			- 1,
			GetDate ())
		AND wloffers.offer_date < GetDate ()
		AND wloffers.response = 'ACC'
)
SELECT
	property.num_bedrooms AS bedrooms, COUNT(*) AS count
FROM
	offers_cte
	JOIN property ON offers_cte.prop_ref = property.prop_ref
WHERE
	property.cat_type = 'GEN'
GROUP BY
	property.num_bedrooms
ORDER BY
	bedrooms DESC;